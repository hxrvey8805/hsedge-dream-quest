import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FullStats } from "@/lib/statisticsUtils";

interface Props {
  stats: FullStats;
}

const tooltips: Record<string, string> = {
  sqn: "System Quality Number measures how tradeable your system is. >2 is good, >3 is excellent, >5 is superb. Needs 30+ trades.",
  kelly: "The Kelly Criterion suggests the optimal % of your capital to risk per trade based on your edge. Needs 20+ trades.",
  kRatio: "K-Ratio measures the consistency of your equity curve growth. Higher = more consistent profits. Needs 20+ trades.",
  stdDev: "Standard deviation of your trade P&L. Lower = more consistent results.",
  prob: "The probability that your trading results could have occurred by random chance. Lower is better. Needs 30+ trades.",
  mae: "Average Maximum Adverse Excursion — how far trades go against you before closing (in pips).",
  mfe: "Average Maximum Favorable Excursion — how far trades go in your favor before closing (in pips).",
};

const MetricRow = ({ label, value, tooltipKey }: { label: string; value: string; tooltipKey: string }) => (
  <Card className="p-3 bg-card border-border/40 flex items-center justify-between">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Tooltip>
        <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/40" /></TooltipTrigger>
        <TooltipContent className="max-w-[240px]"><p className="text-xs">{tooltips[tooltipKey]}</p></TooltipContent>
      </Tooltip>
    </div>
    <span className="text-sm font-bold">{value}</span>
  </Card>
);

export const AdvancedMetrics = ({ stats }: Props) => {
  const [open, setOpen] = useState(false);

  const fmtOrNA = (v: number | null, decimals = 2) => v !== null ? v.toFixed(decimals) : 'N/A';

  return (
    <TooltipProvider>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Advanced Metrics</h2>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricRow label="SQN" value={fmtOrNA(stats.sqn)} tooltipKey="sqn" />
            <MetricRow label="Kelly %" value={stats.kellyPercent !== null ? `${stats.kellyPercent.toFixed(1)}%` : 'N/A'} tooltipKey="kelly" />
            <MetricRow label="K-Ratio" value={fmtOrNA(stats.kRatio)} tooltipKey="kRatio" />
            <MetricRow label="P&L Std Dev" value={`$${stats.tradePLStdDev.toFixed(2)}`} tooltipKey="stdDev" />
            <MetricRow label="Prob. Random" value={stats.probRandomChance !== null ? `${(stats.probRandomChance * 100).toFixed(1)}%` : 'N/A'} tooltipKey="prob" />
            <MetricRow label="Avg MAE" value={stats.avgMAE !== null ? `${stats.avgMAE.toFixed(1)} pips` : 'N/A'} tooltipKey="mae" />
            <MetricRow label="Avg MFE" value={stats.avgMFE !== null ? `${stats.avgMFE.toFixed(1)} pips` : 'N/A'} tooltipKey="mfe" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
};
