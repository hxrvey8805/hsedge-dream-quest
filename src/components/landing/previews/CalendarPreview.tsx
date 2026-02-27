export function CalendarPreview() {
  const days = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ];

  const pnl: Record<number, number> = {
    1: 120, 2: -45, 3: 230, 4: 0, 5: -80,
    7: 340, 8: 150, 9: -120, 10: 90, 11: 275, 12: -30,
    14: 410, 15: 60, 16: -200, 17: 185, 18: 320,
    21: -90, 22: 140, 23: 260, 24: -50, 25: 380,
    28: 190, 29: -70, 30: 445, 31: 210,
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">January 2026</span>
        <span className="text-[10px] text-primary font-medium">+$3,325</span>
      </div>
      <div className="grid grid-cols-7 gap-[3px] text-[9px] mb-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-muted-foreground font-medium py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[3px] flex-1">
        {days.flat().map((day, i) => {
          if (!day) return <div key={i} />;
          const val = pnl[day];
          const bg =
            val === undefined ? "bg-card/30" :
            val > 200 ? "bg-emerald-500/30 border-emerald-500/40" :
            val > 0 ? "bg-emerald-500/15 border-emerald-500/25" :
            val === 0 ? "bg-card/30 border-border/30" :
            val > -100 ? "bg-red-500/15 border-red-500/25" :
            "bg-red-500/30 border-red-500/40";
          return (
            <div key={i} className={`rounded-md border ${bg} flex flex-col items-center justify-center py-1.5`}>
              <span className="text-[9px] text-foreground/70">{day}</span>
              {val !== undefined && (
                <span className={`text-[7px] font-medium ${val >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {val >= 0 ? "+" : ""}{val}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 pt-2 border-t border-border/30">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500/40" />
          <span className="text-[8px] text-muted-foreground">Profit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-red-500/40" />
          <span className="text-[8px] text-muted-foreground">Loss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-card/40 border border-border/30" />
          <span className="text-[8px] text-muted-foreground">No trades</span>
        </div>
      </div>
    </div>
  );
}
