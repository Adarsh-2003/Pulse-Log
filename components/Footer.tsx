"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
  const pathname = usePathname();
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  useEffect(() => {
    if (pathname === "/login") return;
    let cancelled = false;
    fetch("/api/viewers", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { count: null }))
      .then((j) => {
        if (!cancelled) {
          setViewerCount(typeof j.count === "number" ? j.count : null);
        }
      })
      .catch(() => {
        if (!cancelled) setViewerCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500 light:border-zinc-200 light:text-zinc-600">
      <p>
        Vibe coded with fun by{" "}
        <a
          href="https://adarshgupta.works"
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit underline underline-offset-2"
        >
          Adarsh Gupta
        </a>{" "}
        🗿
      </p>
      <p className="mt-3 text-xs text-zinc-500/90 light:text-zinc-600">
        Viewer Count : {viewerCount ?? "--"}
      </p>
    </footer>
  );
}
