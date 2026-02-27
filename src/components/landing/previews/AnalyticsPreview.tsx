export function AnalyticsPreview() {
  const equityCurve = [0, 120, 75, 305, 195, 535, 415, 755, 665, 1010, 870, 1200, 1080, 1325, 1250, 1590, 1480, 1780, 1690, 1950, 1830, 2150, 2050, 2380, 2290, 2600];
  const maxVal = Math.max(...equityCurve);
  const barH = 90;

  const stats = [
    { label: "Win Rate", value: "68.4%", color: "text-emerald-400" },
    { label: "Profit Factor", value: "2.31", color: "text-emerald-400" },
    { label: "Avg RR", value: "1:2.4", color: "text-primary" },
    { label: "Max DD", value: "-8.2%", color: "text-red-400" },
  ];

  const sessions = [
    { name: "London", wr: 72, trades: 48 },
    { name: "New York", wr: 65, trades: 62 },
    { name: "Asian", wr: 58, trades: 24 },
    { name: "Overlap", wr: 78, trades: 31 },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 h-full flex flex-col gap-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border/40 bg-card/30 p-2 text-center">
            <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[8px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div className="flex-1 min-h-0">
        <div className="text-[9px] text-muted-foreground font-medium mb-1">Equity Curve</div>
        <div className="relative w-full" style={{ height: barH }}>
          <svg width="100%" height={barH} viewBox={`0 0 ${equityCurve.length - 1} ${barH}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
              <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,${barH} ${equityCurve.map((v, i) => `L${i},${barH - (v / maxVal) * barH}`).join(" ")} L${equityCurve.length - 1},${barH} Z`}
              fill="url(#eq-grad)"
            />
            <polyline
              points={equityCurve.map((v, i) => `${i},${barH - (v / maxVal) * barH}`).join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Session breakdown */}
      <div>
        <div className="text-[9px] text-muted-foreground font-medium mb-1.5">Win Rate by Session</div>
        <div className="space-y-1.5">
          {sessions.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="text-[9px] text-foreground/70 w-14 shrink-0">{s.name}</span>
              <div className="flex-1 h-3 rounded-full bg-card/40 border border-border/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                  style={{ width: `${s.wr}%` }}
                />
              </div>
              <span className="text-[9px] text-foreground/80 font-medium w-8 text-right">{s.wr}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
