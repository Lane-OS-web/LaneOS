import OpenAI from "openai";
import { z } from "zod";
import {
  parseRateConfirmation,
  parseFreightEmail,
} from "@/lib/ai/parser";
type DocumentType =
  | "rate_confirmation"
  | "bol"
  | "pod"
  | "invoice"
  | "lumper_receipt"
  | "detention_form"
  | "other";

const classificationSchema = z.object({
  document_type: z.enum([
    "rate_confirmation",
    "bol",
    "pod",
    "invoice",
    "lumper_receipt",
    "detention_form",
    "other",
  ]),
  load_number: z.string().optional(),
  reference_number: z.string().optional(),
  broker_name: z.string().optional(),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  rate: z.number().optional(),
  commodity: z.string().optional(),
  weight_lbs: z.number().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  detention_hours: z.number().optional(),
  lumper_amount: z.number().optional(),
  confidence: z.number().min(0).max(1),
});

export type ScannedDocumentData = z.infer<typeof classificationSchema>;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return buffer.toString("utf-8");
  }

  if (
    mimeType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  ) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text?.trim() ?? "";
    } catch {
      return `[PDF document: ${fileName}]`;
    }
  }

  const openai = getOpenAI();
  if (
    openai &&
    (mimeType.startsWith("image/") ||
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType))
  ) {
    const base64 = buffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all readable text from this freight/logistics document. Return plain text only.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      temperature: 0,
    });
    return response.choices[0]?.message?.content?.trim() ?? "";
  }

  return inferFromFileName(fileName);
}

function inferFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  const hints: string[] = [`File: ${fileName}`];
  if (lower.includes("rate")) hints.push("Document type hint: rate confirmation");
  if (lower.includes("bol")) hints.push("Document type hint: bill of lading");
  if (lower.includes("pod")) hints.push("Document type hint: proof of delivery");
  if (lower.includes("lumper")) hints.push("Document type hint: lumper receipt");
  if (lower.includes("detention")) hints.push("Document type hint: detention form");
  const loadMatch = fileName.match(/LP-\d+|load[_-]?\d+/i);
  if (loadMatch) hints.push(`Load number hint: ${loadMatch[0]}`);
  return hints.join("\n");
}

async function classifyWithAI(text: string): Promise<ScannedDocumentData> {
  const openai = getOpenAI();
  if (!openai) return classifyFallback(text);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Classify this freight document and extract key fields. Return JSON with:
document_type (rate_confirmation|bol|pod|invoice|lumper_receipt|detention_form|other),
load_number, reference_number, broker_name, pickup_date (ISO), delivery_date (ISO),
rate (number), commodity, weight_lbs, origin, destination, detention_hours, lumper_amount, confidence (0-1).`,
      },
      { role: "user", content: text.slice(0, 12000) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) return classifyFallback(text);
  return classificationSchema.parse(JSON.parse(raw));
}

function classifyFallback(text: string): ScannedDocumentData {
  const lower = text.toLowerCase();
  let document_type: DocumentType = "other";
  if (lower.includes("rate con") || lower.includes("rate confirmation"))
    document_type = "rate_confirmation";
  else if (lower.includes("bill of lading") || lower.includes("bol"))
    document_type = "bol";
  else if (lower.includes("proof of delivery") || lower.includes("pod"))
    document_type = "pod";
  else if (lower.includes("lumper")) document_type = "lumper_receipt";
  else if (lower.includes("detention")) document_type = "detention_form";
  else if (lower.includes("invoice")) document_type = "invoice";

  const rateMatch = text.match(/\$[\d,]+(?:\.\d{2})?/);
  const loadMatch = text.match(/(?:load|ref|#)\s*[#:]?\s*([\w-]+)/i);

  return classificationSchema.parse({
    document_type,
    load_number: loadMatch?.[1],
    rate: rateMatch
      ? parseFloat(rateMatch[0].replace(/[$,]/g, ""))
      : undefined,
    confidence: 0.45,
  });
}

export async function scanDocumentContent(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  hintType?: string
) {
  const extractedText = await extractTextFromFile(buffer, mimeType, fileName);

  let parsed = await classifyWithAI(extractedText);

  if (hintType && hintType !== "other") {
    parsed = { ...parsed, document_type: hintType as DocumentType };
  }

  if (parsed.document_type === "rate_confirmation" && extractedText.length > 50) {
    const rc = await parseRateConfirmation(extractedText);
    parsed = {
      ...parsed,
      ...rc,
      document_type: "rate_confirmation",
      confidence: Math.max(parsed.confidence, rc.confidence ?? 0),
    };
  }

  if (
    extractedText.toLowerCase().includes("pickup") &&
    extractedText.toLowerCase().includes("delivery") &&
    parsed.document_type === "other"
  ) {
    const emailLike = await parseFreightEmail("", extractedText);
    parsed = {
      ...parsed,
      load_number: emailLike.load_number ?? parsed.load_number,
      broker_name: emailLike.broker_name ?? parsed.broker_name,
      origin: emailLike.origin ?? parsed.origin,
      destination: emailLike.destination ?? parsed.destination,
      pickup_date: emailLike.pickup_date ?? parsed.pickup_date,
      delivery_date: emailLike.delivery_date ?? parsed.delivery_date,
      rate: emailLike.rate ?? parsed.rate,
      commodity: emailLike.commodity ?? parsed.commodity,
      weight_lbs: emailLike.weight_lbs ?? parsed.weight_lbs,
      confidence: Math.max(parsed.confidence, emailLike.confidence ?? 0),
    };
  }

  return { extractedText, parsed };
}

export function buildParsedDataRecord(parsed: ScannedDocumentData) {
  return {
    ...parsed,
    scanned_at: new Date().toISOString(),
  };
}
