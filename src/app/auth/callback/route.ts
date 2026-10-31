import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth callback route untuk OAuth (Google) dan email confirmation.
 * Redirect ke homepage setelah berhasil.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect ke homepage atau halaman asal (dari state)
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
