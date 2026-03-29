import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
  const [expanded, setExpanded] = useState(true);

  // Get monday of current or previous week
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    // If Sat/Sun, use current week's Monday. Otherwise use previous Monday.
    let monday = startOfWeek(now, { weekStartsOn: 1 });
    if (day >= 1 && day <= 5) {
      monday = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    }
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
      <Card className="p-5 bg-card border-border mt-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!review) {
    return (
      <Card className="p-5 bg-card border-border mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Weekend Review
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered analysis of your week ({weekStartFormatted} – {weekEndDate})
            </p>
          </div>
          <Button onClick={generateReview} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Review
              </>
            )}
          </Button>
        </div>
        {generating && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
      </Card>
    );
  }

  const stats = review.week_stats;

  return (
    <Card className="p-5 bg-card border-border mt-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Weekend Review</h3>
          <span className="text-sm text-muted-foreground">
            ({weekStartFormatted} – {weekEndDate})
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <Button variant="outline" size="sm" onClick={generateReview} disabled={generating} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Week Stats Row */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Trades</div>
                <div className="text-xl font-bold">{stats.totalTrades}</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="text-xl font-bold">{stats.winRate}%</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Total Pips</div>
                <div className={`text-xl font-bold ${stats.totalPips >= 0 ? "text-success" : "text-destructive"}`}>
                  {stats.totalPips >= 0 ? "+" : ""}{stats.totalPips.toFixed(1)}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Profit</div>
                <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  ${stats.totalProfit.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Best Trade */}
          {review.best_trade_analysis && (
            <div className="border border-success/30 bg-success/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <h4 className="font-semibold text-success">Best Trade</h4>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{review.best_trade_analysis}</p>
            </div>
          )}

          {/* Worst Trade */}
          {review.worst_trade_analysis && (
            <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-destructive">Worst Trade</h4>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{review.worst_trade_analysis}</p>
            </div>
          )}

          {/* Patterns */}
          {review.patterns_insights && (
            <div className="border border-primary/30 bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-primary">Patterns & Insights</h4>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{review.patterns_insights}</p>
            </div>
          )}

          {/* Next Week Plan */}
          {review.next_week_plan && (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-500" />
                <h4 className="font-semibold text-amber-500">Next Week Game Plan</h4>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{review.next_week_plan}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
