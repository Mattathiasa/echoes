const NUM_WEEKS = 16;

interface DayCount {
  date: string;
  count: number;
}

function cellBg(date: string, todayStr: string, count: number): string {
  if (date > todayStr) return "bg-slate-800/20";
  if (count === 0) return "bg-slate-800/60";
  if (count === 1) return "bg-emerald-950 border border-emerald-800/50";
  if (count <= 3) return "bg-emerald-700";
  return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]";
}

export function ActivityHeatmap({ data }: { data: DayCount[] }) {
  const countByDate = new Map(data.map((r) => [r.date, r.count]));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Monday of current week
  const dow = today.getUTCDay();
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - daysToMon);

  // Start: 15 full weeks before this Monday
  const startMs = thisMonday - (NUM_WEEKS - 1) * 7 * 86_400_000;

  // Build columns: each column is a Mon-Sun week
  const weeks: string[][] = Array.from({ length: NUM_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) =>
      new Date(startMs + (w * 7 + d) * 86_400_000).toISOString().slice(0, 10),
    ),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Activity</p>
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((date) => {
              const count = countByDate.get(date) ?? 0;
              return (
                <div
                  key={date}
                  title={count > 0 ? `${date}: ${count} entr${count === 1 ? "y" : "ies"}` : date}
                  className={`w-2.5 h-2.5 rounded-sm transition-colors ${cellBg(date, todayStr, count)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        <span>Less</span>
        {(["bg-slate-800/60", "bg-emerald-950", "bg-emerald-700", "bg-emerald-400"] as const).map((c) => (
          <div key={c} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
