import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, format } from "date-fns";
import {
  Sparkles, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown,
  Brain, Target, Trophy, AlertTriangle, CalendarDays, Loader2, Zap,
} from "lucide-react";

interface ScreenshotSlot {
  id: string;
  label: string;
  screenshot_url: string | null;
  markers: any[];
}

interface TradeDetail {
  id: string;
  symbol: string;
  pips: number;
  profit: number;
  outcome: string;
  buy_sell: string;
  risk_reward_ratio: string;
  trade_date?: string;
  entry_price?: number;
  exit_price?: number;
  time_opened?: string;
  time_closed?: string;
  session?: string;
  notes?: string;
  screenshots?: string[];
  screenshot_slots?: ScreenshotSlot[];
  markers?: any[];
  screenshot_url?: string | null;
  reflection?: string | null;
}

interface WeekStats {
  totalPips: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bestDay: { date: string; pips: number; profit: number } | null;
  worstDay: { date: string; pips: number; profit: number } | null;
  bestTrade: TradeDetail | null;
  worstTrade: TradeDetail | null;
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

interface Props {
  selectedAccountId: string | null;
  refreshTrigger: number;
}

const ScreenshotWithMarkers = ({ url, markers }: { url: string; markers?: any[] }) => (
  <div className="relative rounded-lg overflow-hidden border border-border">
    <img src={url} alt="Trade screenshot" className="w-full h-auto object-contain" />
    {markers && markers.length > 0 && (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {markers.map((m: any, i: number) => {
          const color = m.type === 'entry' ? '#3b82f6' : m.type === 'stop_loss' ? '#ef4444' : '#22c55e';
          return (
            <g key={i}>
              <circle cx={`${m.x}%`} cy={`${m.y}%`} r="6" fill={color} stroke="white" strokeWidth="2" />
              <text x={`${m.x + 1.5}%`} y={`${m.y + 0.5}%`} fill={color} fontSize="11" fontWeight="bold" dominantBaseline="middle">
                {m.type === 'entry' ? 'E' : m.type === 'stop_loss' ? 'SL' : 'TP'}
              </text>
            </g>
          );
        })}
      </svg>
    )}
  </div>
);

const TradeScreenshots = ({ trade }: { trade: TradeDetail }) => {
  const slots = trade.screenshot_slots?.filter(s => s.screenshot_url) || [];
  const hasMainScreenshot = trade.screenshot_url && slots.length === 0;
  // Also check for screenshots array from the trades table
  const tradeScreenshots = trade.screenshots?.filter(Boolean) || [];

  if (slots.length === 0 && !hasMainScreenshot && tradeScreenshots.length === 0) return null;

  return (
    <div className="space-y-3 w-full max-w-3xl">
      {hasMainScreenshot && (
        <ScreenshotWithMarkers url={trade.screenshot_url!} markers={trade.markers} />
      )}
      {slots.map((slot, idx) => (
        <div key={slot.id || idx}>
          {slot.label && <div className="text-xs text-muted-foreground mb-1 font-medium">{slot.label}</div>}
          <ScreenshotWithMarkers url={slot.screenshot_url!} markers={slot.markers} />
        </div>
      ))}
      {/* Fallback: show trade screenshots from the trades table if no review slides */}
      {slots.length === 0 && !hasMainScreenshot && tradeScreenshots.map((url, idx) => (
        <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
          <img src={url} alt="Trade screenshot" className="w-full h-auto object-contain" />
        </div>
      ))}
    </div>
  );
};

export const WeekendReviewCard = ({ selectedAccountId, refreshTrigger }: Props) => {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 4);
  const weekEndFormatted = format(weekEnd, "MMM d");
  const weekStartFormatted = format(new Date(weekStartDate), "MMM d");

  const totalSlides = 5;

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("weekly_reviews")
          .select("*")
          .eq("week_start_date", weekStartDate)
          .maybeSingle();
        if (data) {
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

  const slideIcons = [
    <CalendarDays className="w-5 h-5" />,
    <Trophy className="w-5 h-5" />,
    <AlertTriangle className="w-5 h-5" />,
    <Brain className="w-5 h-5" />,
    <Target className="w-5 h-5" />,
  ];

  const slideTitles = ["Week Summary", "Best Trade", "Worst Trade", "Patterns & Insights", "Next Week Game Plan"];

  const renderSlide = () => {
    if (!review || !stats) return null;

    switch (currentSlide) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <CalendarDays className="w-6 h-6" />
              <span className="text-xl">Week of {weekStartFormatted} – {weekEndFormatted}</span>
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
              {[
                { label: "Trades", value: stats.totalTrades, color: "text-primary" },
                { label: "Win Rate", value: `${stats.winRate}%`, color: "text-primary" },
                { label: "W / L", value: `${stats.wins} / ${stats.losses}`, color: "text-foreground" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-5 min-w-[120px]">
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-muted-foreground text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: {
        const best = stats.bestTrade;
        return (
          <div className="flex flex-col items-center h-full min-h-[400px] space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-success" />
              <h2 className="text-3xl font-bold text-success">Best Trade</h2>
            </div>
            {best ? (
              <>
                <div className="bg-success/10 border border-success/20 rounded-xl p-5 max-w-lg text-center space-y-1">
                  <div className="text-2xl font-bold">{best.symbol || "N/A"}</div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{best.buy_sell}</span>
                    <span>R:R {best.risk_reward_ratio || "N/A"}</span>
                    <span className="text-success font-semibold">
                      {(best.pips || 0) >= 0 ? "+" : ""}{(best.pips || 0).toFixed(1)} pips
                    </span>
                    {best.profit != null && (
                      <span className="text-success font-semibold">${best.profit.toFixed(2)}</span>
                    )}
                  </div>
                  {(best.time_opened || best.time_closed) && (
                    <div className="text-xs text-muted-foreground">
                      {best.trade_date} · {best.time_opened || "?"} → {best.time_closed || "?"} · {best.session || ""}
                    </div>
                  )}
                  {best.notes && (
                    <div className="text-xs text-muted-foreground/80 mt-1 italic">"{best.notes}"</div>
                  )}
                </div>
                <TradeScreenshots trade={best} />
                {best.reflection && (
                  <div className="bg-muted/30 border border-border rounded-lg p-4 max-w-2xl w-full">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Your Reflection</div>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{best.reflection}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No trade data available</p>
            )}
            <div className="max-w-2xl text-center">
              <div className="text-xs font-semibold text-success mb-2">AI Analysis</div>
              <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.best_trade_analysis}
              </p>
            </div>
          </div>
        );
      }

      case 2: {
        const worst = stats.worstTrade;
        return (
          <div className="flex flex-col items-center h-full min-h-[400px] space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-destructive" />
              <h2 className="text-3xl font-bold text-destructive">Worst Trade</h2>
            </div>
            {worst ? (
              <>
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 max-w-lg text-center space-y-1">
                  <div className="text-2xl font-bold">{worst.symbol || "N/A"}</div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{worst.buy_sell}</span>
                    <span>R:R {worst.risk_reward_ratio || "N/A"}</span>
                    <span className="text-destructive font-semibold">
                      {(worst.pips || 0).toFixed(1)} pips
                    </span>
                    {worst.profit != null && (
                      <span className="text-destructive font-semibold">${worst.profit.toFixed(2)}</span>
                    )}
                  </div>
                  {(worst.time_opened || worst.time_closed) && (
                    <div className="text-xs text-muted-foreground">
                      {worst.trade_date} · {worst.time_opened || "?"} → {worst.time_closed || "?"} · {worst.session || ""}
                    </div>
                  )}
                  {worst.notes && (
                    <div className="text-xs text-muted-foreground/80 mt-1 italic">"{worst.notes}"</div>
                  )}
                </div>
                <TradeScreenshots trade={worst} />
                {worst.reflection && (
                  <div className="bg-muted/30 border border-border rounded-lg p-4 max-w-2xl w-full">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Your Reflection</div>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{worst.reflection}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No trade data available</p>
            )}
            <div className="max-w-2xl text-center">
              <div className="text-xs font-semibold text-destructive mb-2">AI Analysis</div>
              <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                {review.worst_trade_analysis}
              </p>
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-primary" />
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
              <Target className="w-10 h-10 text-amber-500" />
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
      {/* Sleek weekend review trigger */}
      <button
        onClick={handleClick}
        disabled={generating}
        className="group relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 hover:border-primary/40 hover:from-primary/10 hover:to-primary/15 transition-all duration-300 disabled:opacity-50 cursor-pointer px-4 py-2.5 flex items-center gap-3"
      >
        {/* Animated glow accent */}
        <div className="absolute -top-8 -right-8 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
        
        <div className="relative flex items-center gap-2">
          {generating ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <div className="relative">
              <Zap className="w-4 h-4 text-primary" />
              {review && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-pulse" />
              )}
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-start">
          <span className="text-xs font-bold text-primary tracking-wide">
            {generating ? "GENERATING..." : "WEEKEND REVIEW"}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {weekStartFormatted} – {weekEndFormatted}
            {review && <span className="text-success ml-1.5 font-medium">• Ready</span>}
          </span>
        </div>
      </button>

      {/* Full slide presentation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                {slideIcons[currentSlide]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{slideTitles[currentSlide]}</h2>
                <p className="text-sm text-muted-foreground">
                  Slide {currentSlide + 1} of {totalSlides} · Week of {weekStartFormatted} – {weekEndFormatted}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderSlide()}
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <Button variant="outline" onClick={() => setCurrentSlide(p => p - 1)} disabled={currentSlide === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentSlide ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" onClick={() => setCurrentSlide(p => p + 1)} disabled={currentSlide === totalSlides - 1}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
