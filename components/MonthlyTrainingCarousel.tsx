"use client";

type Log = { date: string; text: string };

export function MonthlyTrainingCarousel({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-zinc-500 light:border-zinc-300 light:text-zinc-600">
        No training notes for this month.
      </p>
    );
  }

  return (
    <div className="-mx-1 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
      <div className="flex min-w-min snap-x snap-mandatory gap-4 px-1">
        {logs.map((log) => (
          <article
            key={`${log.date}-${log.text.slice(0, 24)}`}
            className="w-[min(100%,320px)] shrink-0 snap-start rounded-xl border border-white/10 bg-surface-muted/50 p-4 light:border-zinc-200 light:bg-zinc-100/90"
          >
            <p className="text-xs font-medium text-accent">{log.date}</p>
            <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm text-zinc-300 light:text-zinc-800">
              {log.text}
            </pre>
          </article>
        ))}
      </div>
    </div>
  );
}
