"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      if (isSignup) {
        setMessage(data.message || "Akun dibuat. Cek email untuk verifikasi.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/google", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Tidak dapat memulai login Google");
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-h1 font-bold">
          {isSignup ? "Buat Akun" : "Masuk"}
        </h1>
        <p className="text-body text-neutral-700">
          {isSignup
            ? "Daftar untuk kuota chat lebih banyak dan riwayat lintas perangkat"
            : "Masuk ke akun Anda"}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-danger-700 bg-danger-700/10 p-3 text-body text-danger-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-success-700 bg-success-700/10 p-3 text-body text-success-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-body font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-body"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-body font-medium">
            Password {isSignup && "(minimal 8 karakter)"}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-body"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-[44px] w-full rounded-md bg-primary-700 font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-2 text-neutral-700">Atau</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex h-[44px] w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-surface font-semibold hover:bg-neutral-50 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Lanjutkan dengan Google
      </button>

      <p className="text-center text-body text-neutral-700">
        {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="font-semibold text-primary-700 hover:underline"
          disabled={loading}
        >
          {isSignup ? "Masuk" : "Daftar"}
        </button>
      </p>

      <p className="text-center text-sm text-neutral-700">
        Dengan masuk, Anda menyetujui{" "}
        <a href="/kebijakan-privasi" className="text-primary-700 hover:underline">
          Kebijakan Privasi
        </a>
        .
      </p>
    </div>
  );
}
