import { NextResponse, type NextRequest } from "next/server";

/** CSP dengan nonce per permintaan. Perketat sesuai kebutuhan; jangan dilonggarkan sembarangan. */
export function middleware(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src \u0027self\u0027",
    `script-src \u0027self\u0027 \u0027nonce-${nonce}\u0027 \u0027strict-dynamic\u0027${dev ? " \u0027unsafe-eval\u0027" : ""}`,
    `style-src \u0027self\u0027 \u0027unsafe-inline\u0027`,
    "img-src \u0027self\u0027 data:",
    "font-src \u0027self\u0027",
    "connect-src \u0027self\u0027",
    "frame-ancestors \u0027none\u0027",
    "base-uri \u0027self\u0027",
    "form-action \u0027self\u0027",
  ].join("; ");

  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico).*)" }],
};
