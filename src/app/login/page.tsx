"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "@/lib/client/api";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/auth/login", { email, password });
      router.push("/today");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="text-5xl">🌸</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Bloom</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Welcome back
        </p>
      </div>
      <form onSubmit={submit} className="card">
        <label className="mb-3 block">
          <span className="label">Email</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-3 block">
          <span className="label">Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="mb-3 text-sm" style={{ color: "var(--bad)" }}>
            {error}
          </p>
        )}
        <Button type="submit" block disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm" style={{ color: "var(--muted)" }}>
        New here?{" "}
        <Link href="/register" className="font-bold" style={{ color: "var(--accent)" }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
