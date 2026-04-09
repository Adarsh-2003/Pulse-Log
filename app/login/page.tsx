"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const nerdErrors = [
  "Nope. That password is giving NPC energy.",
  "Cap detected. Try again, main character.",
  "Bro that key ain't it.",
  "Access denied. The gym gods said not today.",
  "Wrong combo, my guy. Recheck and rerun.",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        setError(nerdErrors[Math.floor(Math.random() * nerdErrors.length)]);
        return;
      }
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/logs");
      router.refresh();
    } catch {
      setError("Network glitch. Even localhost has bad days.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-accent/60 bg-surface-muted/40 p-8 light:border-accent/60 light:bg-zinc-50">
        <h1 className="text-center text-xl font-semibold text-zinc-100 light:text-zinc-900">
          Are you Adarsh? Verify.
        </h1>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="text-xs text-zinc-400 light:text-zinc-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-zinc-100 outline-none ring-accent focus:ring-1 light:border-zinc-300 light:bg-white light:text-zinc-900"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs text-zinc-400 light:text-zinc-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-zinc-100 outline-none ring-accent focus:ring-1 light:border-zinc-300 light:bg-white light:text-zinc-900"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-amber-400/90 light:text-amber-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent py-2.5 text-sm font-medium text-zinc-950 hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
