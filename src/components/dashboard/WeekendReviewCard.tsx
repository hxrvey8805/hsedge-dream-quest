import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, format } from "date-fns";
import {
  Sparkles, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown,
  Brain, Target, BarChart3, Trophy, AlertTriangle, CalendarDays,
} from "lucide-react";

interface WeekStats {
  totalPips: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bestDay: { date: string; pips: number; profit: number } | null;
  worstDay: { date: string; pips: number; profit: number } | null;
  bestTrade: { id: string; symbol: string; pips: number; profit: number; outcome: string; buy_sell: string; risk_reward_ratio: string } | null;
  worstTrade: { id: string; symbol: string; pips: number; profit: number; outcome: string; buy_sell: string; risk_reward_ratio: string } | null;
}

interface WeeklyReview {
  id: string;
  week_start_date: string;
  week_stats: WeekStats;
  best_trade_analysis: string;
  worst_trade_analysis: string;
  patterns_insights: string;
  next_week_plan: string;
}

interface WeekendReviewCardProps {
  selectedAccountId: string | null;
  refreshTrigger: number;
}

export const WeekendReviewCard = ({ selectedAccountId, refreshTrigger }: WeekendReviewCardProps) => {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEndDate = (() => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + 4);
    return format(d, "MMM d");
  })();
  const weekStartFormatted = format(new Date(weekStartDate), "MMM d");

  const totalSlides = 5; // Summary, Best Trade, Worst Trade, Patterns, Next Week

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("weekly_reviews")
          .select("*")
          .eq("week_start_date", weekStartDate)
          .maybeSingle();
        if (!error && data) {
          setReview({ ...data, week_stats: data.week_stats as unknown as WeekStats } as WeeklyReview);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [weekStartDate, refreshTrigger]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekend-review", {
        body: { week_start_date: weekStartDate, selected_account_id: selectedAccountId },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setReview({ ...data, week_stats: data.week_stats as WeekStats });
      setCurrentSlide(0);
      setDialogOpen(true);
      toast.success("Weekend review ready!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate review");
    } finally {
      setGenerating(false);
    }
  };

  const handleClick = () => {
    if (review) {
      setCurrentSlide(0);
      setDialogOpen(true);
    } else {
      handleGenerate();
    }
  };

  if (loading) return null;

  const stats = review?.week_stats;

  const getSlideTitle = () => {
    switch (currentSlide) {
      case 0: return "Week Summary";
      case 1: return "Best Trade";
      case 2: return "Worst Trade";
      case 3: return "Patterns & Insights";
      case 4: return "Next Week Game Plan";
      default: return "";
    }
  };

  const renderSlide = () => {
    if (!review || !stats) return null;

    switch (currentSlide) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <CalendarDays className="w-6 h-6" />
              <span className="text-xl">Week of {weekStartFormatted} – {weekEndDate}</span>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-bold flex items-center justify-center gap-3">
                {stats.totalPips >= 0 ? (
                  <TrendingUp className="w-16 h-16 text-success" />
                ) : (
                  <TrendingDown className="w-16 h-16 text-destructive" />
                )}
                <span className={stats.totalPips >= 0 ? "text-success" : "text-destructive"}>
                  {stats.totalPips >= 0 ? "+" : ""}{stats.totalPips.toFixed(1)} pips
                </span>
              </div>
              <p className="text-2xl text-muted-foreground">
                ${stats.totalProfit >= 0 ? "+" : ""}{stats.totalProfit.toFixed(2)} P&L
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-card border rounded-xl p-6 min-w-[140px]">
                <div className="text-4xl font-bold text-primary">{stats.totalTrades}</div>
                <div className="text-muted-foreground">Trades</div>
              </div>
              <div className="bg-card border rounded-xl p-6 min-w-[140px]">
                <div className="text-4xl font-bold text-primary">{stats.winRate}%</div>
                <div className="text-muted-foreground">Win Rate</div>
              </div>
              <div className="bg-card border rounded-xl p-6 min-w-[140px]">
                <div className="text-4xl font-bold text-success">{stats.wins}</div>
                <div className="text-muted-foreground">Wins</div>
              </div>
            </div>
            {stats.bestDay && stats.worstDay && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Best Day</div>
                  <div className="font-bold text-success">{format(new Date(stats.bestDay.date), "EEE")}</div>
                  <div className="text-sm text-success">+{stats.bestDay.pips.toFixed(1)} pips</div>
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Worst Day</div>
                  <div className="font-bold text-destructive">{format(new Date(stats.worstDay.date), "EEE")}</div>
                  <div className="text-sm text-destructive">{stats.worstDay.pips.toFixed(1)} pips</div>
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-12 h-12 text-success" />
              <h2 className="text-3xl font-bold text-success">Best Trade</h2>
            </div>
            {stats.bestTrade && (
              <div className="bg-success/10 border border-success/20 rounded-xl p-6 max-w-lg text-center space-y-2">
                <div className="text-2xl font-bold">{stats.bestTrade.symbol || "N/A"}</div>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <span>{stats.bestTrade.buy_sell}</span>
                  <span>R:R {stats.bestTrade.risk_reward_ratio || "N/A"}</span>
                  <span className="text-success font-semibold">
                    {(stats.bestTrade.pips || 0) >= 0 ? "+" : ""}{(stats.bestTrade.pips || 0).toFixed(1)} pips
                  </span>
                </div>
              </div>
            )}
            <div className="max-w-2xl text-center">
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.best_trade_analysis}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <h2 className="text-3xl font-bold text-destructive">Worst Trade</h2>
            </div>
            {stats.worstTrade && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-lg text-center space-y-2">
                <div className="text-2xl font-bold">{stats.worstTrade.symbol || "N/A"}</div>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <span>{stats.worstTrade.buy_sell}</span>
                  <span>R:R {stats.worstTrade.risk_reward_ratio || "N/A"}</span>
                  <span className="text-destructive font-semibold">
                    {(stats.worstTrade.pips || 0).toFixed(1)} pips
                  </span>
                </div>
              </div>
            )}
            <div className="max-w-2xl text-center">
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.worst_trade_analysis}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="flex items-center gap-3">
              <Brain className="w-12 h-12 text-primary" />
              <h2 className="text-3xl font-bold text-primary">Patterns & Insights</h2>
            </div>
            <div className="max-w-2xl text-center">
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.patterns_insights}
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="flex items-center gap-3">
              <Target className="w-12 h-12 text-amber-500" />
              <h2 className="text-3xl font-bold text-amber-500">Next Week Game Plan</h2>
            </div>
            <div className="max-w-2xl text-center">
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.next_week_plan}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Small trigger button */}
      <button
        onClick={handleClick}
        disabled={generating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all text-xs font-medium disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {generating ? "Generating..." : review ? "Weekend Review" : "Generate Review"}
      </button>

      {/* Slide Presentation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold">{getSlideTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                Slide {currentSlide + 1} of {totalSlides} · Week of {weekStartFormatted} – {weekEndDate}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Slide Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderSlide()}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <Button
              variant="outline"
              onClick={() => setCurrentSlide(prev => prev - 1)}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSlide ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentSlide(prev => prev + 1)}
              disabled={currentSlide === totalSlides - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
