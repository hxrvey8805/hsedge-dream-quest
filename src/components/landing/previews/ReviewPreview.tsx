import { Check, X, Lightbulb } from "lucide-react";

export function ReviewPreview() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-foreground">Daily Review — Jan 14</div>
          <div className="text-[8px] text-muted-foreground">5 trades · +$410 · 80% win rate</div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= 3 ? "bg-primary" : "bg-border/40"}`} />
          ))}
        </div>
      </div>

      {/* Screenshot mockup */}
      <div className="rounded-lg border border-border/40 bg-card/30 aspect-[16/9] mb-3 flex items-center justify-center overflow-hidden relative">
        {/* Fake candlestick chart */}
        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" className="opacity-50">
          {[
            { x: 15, o: 65, c: 45, h: 30, l: 70 },
            { x: 30, o: 45, c: 35, h: 25, l: 50 },
            { x: 45, o: 35, c: 50, h: 25, l: 55 },
            { x: 60, o: 50, c: 40, h: 30, l: 55 },
            { x: 75, o: 40, c: 55, h: 30, l: 60 },
            { x: 90, o: 55, c: 45, h: 35, l: 60 },
            { x: 105, o: 45, c: 30, h: 20, l: 50 },
            { x: 120, o: 30, c: 40, h: 20, l: 45 },
            { x: 135, o: 40, c: 25, h: 15, l: 45 },
            { x: 150, o: 25, c: 35, h: 15, l: 40 },
            { x: 165, o: 35, c: 20, h: 10, l: 40 },
            { x: 180, o: 20, c: 30, h: 10, l: 35 },
          ].map((c, i) => {
            const bull = c.c < c.o;
            const color = bull ? "hsl(var(--primary))" : "#ef4444";
            return (
              <g key={i}>
                <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={color} strokeWidth="0.8" />
                <rect x={c.x - 4} y={Math.min(c.o, c.c)} width="8" height={Math.abs(c.o - c.c) || 1} fill={color} rx="0.5" />
              </g>
            );
          })}
          {/* Entry arrow */}
          <circle cx="105" cy="30" r="3" fill="hsl(var(--primary))" opacity="0.8" />
          <text x="105" y="22" textAnchor="middle" fill="hsl(var(--primary))" fontSize="6" fontWeight="bold">▶ Entry</text>
        </svg>
      </div>

      {/* Review sections */}
      <div className="space-y-2 flex-1">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] font-semibold text-emerald-400">What Went Well</span>
          </div>
          <p className="text-[8px] text-foreground/60 leading-relaxed">Followed plan perfectly. Waited for OB confirmation before entry. Took partials at 1:2.</p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <X className="h-3 w-3 text-amber-400" />
            <span className="text-[9px] font-semibold text-amber-400">Missed Opportunities</span>
          </div>
          <p className="text-[8px] text-foreground/60 leading-relaxed">Missed the GBP/JPY FVG setup during NY open. Was distracted reviewing earlier trades.</p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-semibold text-primary">Lessons Learned</span>
          </div>
          <p className="text-[8px] text-foreground/60 leading-relaxed">Set alerts for key levels so I don't miss setups while reviewing. Discipline was strong today.</p>
        </div>
      </div>
    </div>
  );
}
