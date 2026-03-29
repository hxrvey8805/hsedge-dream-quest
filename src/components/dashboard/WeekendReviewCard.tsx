import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, format, subWeeks } from "date-fns";
import { Sparkles, TrendingUp, TrendingDown, Brain, Target, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface WeekStats {
  totalPips: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bestDay: { date: string; pips: number; profit: number } | null;
  worstDay: { date: string; pips: number; profit: number } | null;
}

interface WeeklyReview {
  id: string;
  week_start_date: string;
  week_stats: WeekStats;
  best_trade_analysis: string;
  worst_trade_analysis: string;
  patterns_insights: string;
  next_week_plan: string;
  created_at: string;
  updated_at: string;
}

interface WeekendReviewCardProps {
  selectedAccountId: string | null;
  refreshTrigger: number;
}

export const WeekendReviewCard = ({ selectedAccountId, refreshTrigger }: WeekendReviewCardProps) => {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getWeekStart = () => {
    const now = new Date();
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    return format(monday, "yyyy-MM-dd");
  };

  const weekStartDate = getWeekStart();

  const fetchExistingReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("week_start_date", weekStartDate)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setReview({
          ...data,
          week_stats: data.week_stats as unknown as WeekStats,
        } as WeeklyReview);
      }
    } catch (err) {
      console.error("Error fetching review:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingReview();
  }, [weekStartDate, refreshTrigger]);

  const generateReview = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekend-review", {
        body: {
          week_start_date: weekStartDate,
          selected_account_id: selectedAccountId,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setReview({
        ...data,
        week_stats: data.week_stats as WeekStats,
      });
      setExpanded(true);
      toast.success("Weekend review generated!");
    } catch (err: any) {
      console.error("Generate error:", err);
      toast.error(err.message || "Failed to generate review");
    } finally {
      setGenerating(false);
    }
  };

  const weekEndDate = (() => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + 4);
    return format(d, "MMM d");
  })();
  const weekStartFormatted = format(new Date(weekStartDate), "MMM d");

  if (loading) {
    return (
      <div className="mb-3">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  // Compact banner - no review yet
  if (!review) {
    return (
      <div className="mb-3 flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Weekend Review</span>
          <span className="text-xs text-muted-foreground">({weekStartFormatted} – {weekEndDate})</span>
        </div>
        <Button size="sm" onClick={generateReview} disabled={generating} className="gap-1.5 h-7 text-xs">
          {generating ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Generate
            </>
          )}
        </Button>
      </div>
    );
  }

  const stats = review.week_stats;

  // Compact expandable review
  return (
    <div className="mb-3 border border-primary/20 bg-primary/5 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Weekend Review</span>
          {stats && (
            <span className="text-xs text-muted-foreground">
              {stats.totalTrades} trades · {stats.winRate}% WR ·{" "}
              <span className={stats.totalPips >= 0 ? "text-success" : "text-destructive"}>
                {stats.totalPips >= 0 ? "+" : ""}{stats.totalPips.toFixed(1)} pips
              </span>
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <Button variant="ghost" size="sm" onClick={generateReview} disabled={generating} className="gap-1 h-7 text-xs">
          <RefreshCw className={`w-3 h-3 ${generating ? "animate-spin" : ""}`} />
          {generating ? "..." : "Redo"}
        </Button>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2.5 border-t border-primary/10 pt-2.5">
          {/* Mini stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Trades", value: stats.totalTrades },
                { label: "Win Rate", value: `${stats.winRate}%` },
                { label: "Pips", value: `${stats.totalPips >= 0 ? "+" : ""}${stats.totalPips.toFixed(1)}`, color: stats.totalPips >= 0 },
                { label: "Profit", value: `$${stats.totalProfit.toFixed(0)}`, color: stats.totalProfit >= 0 },
              ].map((s) => (
                <div key={s.label} className="bg-background/50 rounded px-2 py-1.5 text-center">
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  <div className={`text-sm font-bold ${s.color !== undefined ? (s.color ? "text-success" : "text-destructive") : ""}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sections */}
          {review.best_trade_analysis && (
            <div className="bg-success/5 border border-success/20 rounded px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-semibold text-success">Best Trade</span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{review.best_trade_analysis}</p>
            </div>
          )}

          {review.worst_trade_analysis && (
            <div className="bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive">Worst Trade</span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{review.worst_trade_analysis}</p>
            </div>
          )}

          {review.patterns_insights && (
            <div className="bg-primary/5 border border-primary/20 rounded px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Patterns & Insights</span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{review.patterns_insights}</p>
            </div>
          )}

          {review.next_week_plan && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500">Next Week Plan</span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{review.next_week_plan}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
