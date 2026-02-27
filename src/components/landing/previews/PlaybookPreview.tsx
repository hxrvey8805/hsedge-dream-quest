import { BookOpen } from "lucide-react";

export function PlaybookPreview() {
  const setups = [
    { name: "Order Block Reversal", trades: 42, wr: 74, pf: 2.8, avgRR: "1:3.1", pl: "+$4,230", color: "emerald" },
    { name: "Fair Value Gap", trades: 31, wr: 68, pf: 2.1, avgRR: "1:2.4", pl: "+$2,870", color: "emerald" },
    { name: "Liquidity Sweep", trades: 27, wr: 63, pf: 1.7, avgRR: "1:2.0", pl: "+$1,540", color: "emerald" },
    { name: "Break & Retest", trades: 19, wr: 47, pf: 0.9, avgRR: "1:1.8", pl: "-$320", color: "red" },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold text-foreground">ICT Concepts</div>
          <div className="text-[8px] text-muted-foreground">4 setups · 119 trades</div>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 gap-1 text-[7px] text-muted-foreground font-medium uppercase tracking-wider pb-1.5 border-b border-border/30 mb-1">
        <span className="col-span-2">Setup</span>
        <span className="text-center">Trades</span>
        <span className="text-center">Win %</span>
        <span className="text-center">PF</span>
        <span className="text-right">P&L</span>
      </div>

      {/* Rows */}
      <div className="flex-1 space-y-0.5">
        {setups.map((s) => (
          <div key={s.name} className="grid grid-cols-6 gap-1 items-center py-1.5 rounded-md hover:bg-card/40 px-1 transition-colors">
            <div className="col-span-2 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${s.color === "emerald" ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-[9px] text-foreground/90 font-medium truncate">{s.name}</span>
            </div>
            <span className="text-[9px] text-foreground/60 text-center">{s.trades}</span>
            <span className={`text-[9px] text-center font-medium ${s.wr >= 60 ? "text-emerald-400" : "text-red-400"}`}>{s.wr}%</span>
            <span className={`text-[9px] text-center ${s.pf >= 1 ? "text-foreground/70" : "text-red-400"}`}>{s.pf}</span>
            <span className={`text-[9px] text-right font-medium ${s.color === "emerald" ? "text-emerald-400" : "text-red-400"}`}>{s.pl}</span>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-2 pt-2 border-t border-border/30 flex justify-between items-center">
        <span className="text-[8px] text-muted-foreground">Best setup: <span className="text-foreground/80 font-medium">Order Block Reversal</span></span>
        <span className="text-[9px] text-emerald-400 font-semibold">+$8,320 total</span>
      </div>
    </div>
  );
}
