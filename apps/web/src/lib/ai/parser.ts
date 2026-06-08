import OpenAI from "openai";
import { z } from "zod";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const emailParseSchema = z.object({
  load_number: z.string().optional(),
  broker_name: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  rate: z.number().optional(),
  commodity: z.string().optional(),
  weight_lbs: z.number().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const rateConfirmationSchema = z.object({
  broker_name: z.string().optional(),
  load_number: z.string().optional(),
  reference_number: z.string().optional(),
  pickup_address: z.string().optional(),
  delivery_address: z.string().optional(),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  rate: z.number().optional(),
  fuel_surcharge: z.number().optional(),
  commodity: z.string().optional(),
  weight_lbs: z.number().optional(),
  miles: z.number().optional(),
  detention_policy: z.string().optional(),
  payment_terms: z.number().optional(),
  confidence: z.number().min(0).max(1),
});

const revenueAnalysisSchema = z.object({
  claims: z.array(
    z.object({
      claim_type: z.enum([
        "detention",
        "lumper",
        "tonu",
        "accessorial",
        "short_pay",
        "other",
      ]),
      amount: z.number(),
      description: z.string(),
      detention_hours: z.number().optional(),
    })
  ),
  total_recoverable: z.number(),
  confidence: z.number().min(0).max(1),
});

async function parseWithAI<T>(
  systemPrompt: string,
  content: string,
  schema: z.ZodType<T>
): Promise<T> {
  const openai = getOpenAI();
  if (!openai) {
    return parseFallback(content, schema);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI");

  const parsed = JSON.parse(raw);
  return schema.parse(parsed);
}

function parseFallback<T>(content: string, schema: z.ZodType<T>): T {
  const rateMatch = content.match(/\$[\d,]+(?:\.\d{2})?/);
  const rate = rateMatch
    ? parseFloat(rateMatch[0].replace(/[$,]/g, ""))
    : undefined;

  const weightMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*(?:lbs?|pounds)/i);
  const weight = weightMatch
    ? parseInt(weightMatch[1].replace(/,/g, ""))
    : undefined;

  const loadMatch = content.match(/(?:load|ref|#)\s*[#:]?\s*(\w[\w-]+)/i);

  const base = {
    load_number: loadMatch?.[1],
    rate,
    weight_lbs: weight,
    confidence: 0.4,
  };

  return schema.parse(base);
}

export async function parseFreightEmail(subject: string, body: string) {
  const content = `Subject: ${subject}\n\n${body}`;
  return parseWithAI(
    `You are a freight logistics AI assistant. Parse this broker/load email and extract structured load data. Return JSON with fields: load_number, broker_name, origin, destination, pickup_date (ISO), delivery_date (ISO), rate (number), commodity, weight_lbs, contact_email, contact_phone, notes, confidence (0-1).`,
    content,
    emailParseSchema
  );
}

export async function parseRateConfirmation(text: string) {
  return parseWithAI(
    `You are a freight logistics AI assistant. Parse this rate confirmation document and extract: broker_name, load_number, reference_number, pickup_address, delivery_address, pickup_date (ISO), delivery_date (ISO), rate, fuel_surcharge, commodity, weight_lbs, miles, detention_policy, payment_terms (days), confidence (0-1). Return JSON.`,
    text,
    rateConfirmationSchema
  );
}

export async function analyzeRevenueRecovery(
  loadData: Record<string, unknown>,
  documents: string[]
) {
  const content = `Load data: ${JSON.stringify(loadData)}\n\nDocuments/notes:\n${documents.join("\n---\n")}`;

  if (!process.env.OPENAI_API_KEY) {
    return revenueAnalysisSchema.parse({
      claims: [],
      total_recoverable: 0,
      confidence: 0,
    });
  }

  return parseWithAI(
    `You are a freight revenue recovery specialist. Analyze this load for missed revenue: detention, lumper fees, TONU, accessorials, short pay. Return JSON with claims array (claim_type, amount, description, detention_hours), total_recoverable, confidence (0-1).`,
    content,
    revenueAnalysisSchema
  );
}
