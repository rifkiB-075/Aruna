import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * POST /api/auth/signup
 * Daftar akun warga dengan email/password (verifikasi email wajib).
 * Rate limit: 5 signup per jam per IP (via middleware atau Supabase Auth default).
 */
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }

  // Validasi password strength (min 8 char, Supabase default)
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Supabase kirim email verifikasi otomatis
  return NextResponse.json({ 
    message: "Akun dibuat. Cek email untuk verifikasi.",
    user: data.user 
  });
}
