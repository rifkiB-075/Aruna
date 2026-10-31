import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * In-memory rate limiter untuk signup (MVP).
 * ponytail: Upstash Redis untuk production (multi-instance).
 * Limit: 5 signup per jam per IP.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const signupLimits = new Map<string, RateLimitEntry>();

// Cleanup setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of signupLimits.entries()) {
    if (now > entry.resetAt) {
      signupLimits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

function checkSignupRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const limit = 5;
  const windowMs = 60 * 60 * 1000; // 1 jam
  const now = Date.now();

  const entry = signupLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    // Buat entry baru
    signupLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

export function middleware(request: NextRequest) {
  // Rate limit hanya untuk signup
  if (request.nextUrl.pathname === "/api/auth/signup") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";
    const { allowed, remaining } = checkSignupRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan signup. Coba lagi dalam 1 jam." },
        { 
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/auth/:path*",
};
