"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

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
    </footer>
  );
}
