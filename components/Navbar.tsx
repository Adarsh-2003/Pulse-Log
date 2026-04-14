"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/logs", label: "Logs" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/status", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((j) => {
        if (!cancelled) setAuthenticated(Boolean(j.authenticated));
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    setAuthenticated(false);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur-md light:border-zinc-200/80 light:bg-surface/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[0.08em] text-zinc-100 transition-all duration-300 hover:tracking-[0.12em] hover:text-accent light:text-zinc-900"
        >
          FitLog
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href
                  ? "text-accent"
                  : "text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900"
              }
            >
              {label}
            </Link>
          ))}
          {authenticated && (
            <button
              type="button"
              onClick={() => void logout()}
              className="text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
