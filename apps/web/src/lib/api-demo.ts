import { NextResponse } from "next/server";
import { demoLoads, demoParsedEmail, isDemoMode } from "@/lib/demo";

export function demoResponse<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json({ ...data, demo: true });
}

export function demoBlocked() {
  return NextResponse.json(
    {
      error: "Demo mode — add Supabase credentials to .env.local to save data.",
      demo: true,
    },
    { status: 503 }
  );
}

export { isDemoMode, demoLoads, demoParsedEmail };
