import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, TrendingUp, TrendingDown, Brain, Target, AlertTriangle, Image, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Marker {
  id: string;
  type: "entry" | "stop_loss" | "take_profit" | "time";
  x: number;
  y: number;
  useLineMode?: boolean;
  markerSize?: number;
  labelX?: number;
  rotation?: number;
  arrowLength?: number;
}

interface ScreenshotSlot {
  id: string;
  label: string;
  screenshot_url: string | null;
  markers: Marker[];
}

interface TradeToStudy {
  tradeId: string;
  symbol: string;
  outcome: string;
  profit: number | null;
  timeOpened: string | null;
  reflection: string;
  screenshotUrl: string | null;
  markers: Marker[];
  screenshotSlots?: ScreenshotSlot[];
  reviewDate: string;
  reason: string;
}

interface MissedOpp {
  id: string;
  screenshot_url: string | null;
  markers: Marker[];
}

interface PerformanceStats {
  winRate: number;
  totalPL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bestDayPL: number | null;
  worstDayPL: number | null;
  bestSetup: string | null;
  daysReviewed: number;
  avgExecutionRating: number | null;
}

interface GeneratedContent {
  patternTitle: string;
  patternInsight: string;
  todaysFocus: string;
  mentalGame: string;
}

interface AIGamePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

// ─── Read-only image with markers ────────────────────────────────────────────

function ReadOnlyTradeImage({
  screenshotUrl,
  markers,
  timeOpened,
}: {
  screenshotUrl: string;
  markers: Marker[];
  timeOpened?: string | null;
}) {
  const getLineColor = (type: Marker["type"]) => {
    if (type === "entry") return "#3b82f6";
    if (type === "stop_loss") return "#ef4444";
    if (type === "take_profit") return "#10b981";
    return "#a855f7";
  };

  const getLabel = (m: Marker) => {
    if (m.type === "entry") return "Entry";
    if (m.type === "stop_loss") return "Stop Loss";
    if (m.type === "take_profit") return "Take Profit";
    return timeOpened ? `Trade: ${timeOpened}` : "Trade Time";
  };

  return (
    <div className="relative inline-block" style={{ maxWidth: "100%", maxHeight: "100%" }}>
      <img
        src={screenshotUrl}
        alt="Trade chart"
        className="block w-auto h-auto max-w-full max-h-[380px]"
        style={{ objectFit: "contain" }}
      />
      {markers.map((marker) => {
        const color = getLineColor(marker.type);
        const size = marker.markerSize || 20;
        const useLineMode = marker.useLineMode !== undefined ? marker.useLineMode : marker.type === "time";

        if (useLineMode) {
          return (
            <div
              key={marker.id}
              className="absolute pointer-events-none"
              style={{ left: 0, right: 0, top: `${marker.y}%`, transform: "translateY(-50%)" }}
            >
              <div className="w-full" style={{ height: Math.max(2, size / 8), backgroundColor: color }} />
              {marker.type === "time" && (
                <div
                  className="absolute"
                  style={{
                    left: `${marker.x}%`,
                    transform: "translateX(-50%)",
                    top: "-150%",
                    bottom: "-150%",
                    width: Math.max(3, size / 6),
                    backgroundColor: color,
                    borderRadius: 2,
                  }}
                />
              )}
              <div
                className="absolute px-1.5 py-0.5 rounded text-white text-xs font-medium"
                style={{
                  left: `${marker.labelX ?? marker.x}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: color,
                  fontSize: Math.max(8, size / 3),
                  whiteSpace: "nowrap",
                }}
              >
                {getLabel(marker)}
              </div>
            </div>
          );
        }

        // Arrow marker
        const rotation = marker.rotation ?? 180;
        const lengthMult = marker.arrowLength ?? 1;
        const lm = Math.round(34 * lengthMult);
        const arrowSize = 12;
        return (
          <div
            key={marker.id}
            className="absolute pointer-events-none"
            style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}>
              <svg width={arrowSize} height={Math.round(arrowSize * 1.4 * lengthMult)} viewBox={`0 0 24 ${lm}`} fill="none" style={{ display: "block" }}>
                <path
                  d={`M12 0 L20 12 L15 12 L15 ${lm - 2} C15 ${lm - 0.9} 14.1 ${lm} 13 ${lm} L11 ${lm} C9.9 ${lm} 9 ${lm - 0.9} 9 ${lm - 2} L9 12 L4 12 Z`}
                  fill={color}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────

function TitleSlide({ date, isLoading }: { date: Date; isLoading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-violet-500/20">
          <Sparkles className="w-10 h-10 text-violet-400" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-bold">AI Game Plan</h2>
        <p className="text-xl text-muted-foreground flex items-center gap-2 justify-center">
          <Calendar className="w-5 h-5" />
          {format(date, "EEEE, MMMM d, yyyy")}
        </p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-violet-400">
            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Analysing your last 7 days...</span>
          </div>
          <p className="text-xs text-muted-foreground">Reading your reviews, trades & patterns</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Generated from your last 7 days of trading data</p>
      )}
    </div>
  );
}

function StatsSlide({ stats }: { stats: PerformanceStats }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 justify-center">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold">Performance Snapshot</h3>
      </div>
      <p className="text-center text-muted-foreground">Last 7 days at a glance</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{stats.totalTrades}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Trades</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${stats.winRate >= 50 ? "text-emerald-500" : "text-destructive"}`}>
            {stats.winRate.toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${stats.totalPL >= 0 ? "text-emerald-500" : "text-destructive"}`}>
            {stats.totalPL >= 0 ? "+" : ""}${stats.totalPL.toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total P&L</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-500">{stats.wins}W</div>
          <div className="text-sm text-muted-foreground mt-1">Wins</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{stats.losses}L</div>
          <div className="text-sm text-muted-foreground mt-1">Losses</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.daysReviewed}</div>
          <div className="text-sm text-muted-foreground mt-1">Days Reviewed</div>
        </div>
      </div>

      {(stats.bestSetup || stats.avgExecutionRating !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.bestSetup && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Setup</div>
              <div className="font-semibold text-emerald-400">{stats.bestSetup}</div>
            </div>
          )}
          {stats.avgExecutionRating !== null && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Execution Rating</div>
              <div className="font-semibold text-primary">{stats.avgExecutionRating.toFixed(1)} / 5</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIInsightsSlide({ content }: { content: GeneratedContent }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 justify-center">
        <Brain className="w-8 h-8 text-violet-400" />
        <h3 className="text-2xl font-bold">Pattern Detected</h3>
      </div>

      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-violet-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold text-lg">{content.patternTitle}</span>
        </div>
        <p className="text-foreground leading-relaxed">{content.patternInsight}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Based on your review notes and trade reflections from the past 7 days
      </p>
    </div>
  );
}

function TradeStudySlide({ tradeData }: { tradeData: TradeToStudy }) {
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const slots = tradeData.screenshotSlots && tradeData.screenshotSlots.length > 0
    ? tradeData.screenshotSlots.filter(s => s.screenshot_url)
    : tradeData.screenshotUrl
      ? [{ id: "main", label: "Chart", screenshot_url: tradeData.screenshotUrl, markers: tradeData.markers }]
      : [];

  const activeSlot = slots[activeSlotIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3 justify-center">
        <Target className={`w-7 h-7 ${tradeData.outcome === "Win" ? "text-emerald-500" : "text-destructive"}`} />
        <h3 className="text-xl font-bold">
          Trade to Study:{" "}
          <span className={tradeData.outcome === "Win" ? "text-emerald-500" : "text-destructive"}>
            {tradeData.symbol}
          </span>
        </h3>
        <span className="text-sm text-muted-foreground">{tradeData.reviewDate}</span>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-sm text-amber-400 text-center">
        {tradeData.reason}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        {/* Image */}
        <div className="flex flex-col gap-3">
          {slots.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {slots.map((slot, i) => (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlotIndex(i)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    i === activeSlotIndex ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
          <div className="bg-card border rounded-lg overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
            {activeSlot?.screenshot_url ? (
              <ReadOnlyTradeImage
                screenshotUrl={activeSlot.screenshot_url}
                markers={activeSlot.markers}
                timeOpened={tradeData.timeOpened}
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Image className="w-12 h-12 mb-2 opacity-40" />
                <p className="text-sm">No screenshot for this trade</p>
              </div>
            )}
          </div>
        </div>

        {/* Info & reflection */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{tradeData.symbol}</span>
              <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                tradeData.outcome === "Win"
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-destructive/20 text-destructive"
              }`}>
                {tradeData.outcome}
              </span>
            </div>
            {tradeData.profit !== null && (
              <div className={`text-2xl font-bold ${tradeData.profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {tradeData.profit >= 0 ? "+" : ""}${tradeData.profit.toFixed(2)}
              </div>
            )}
            {tradeData.timeOpened && (
              <div className="text-sm text-muted-foreground">Opened: {tradeData.timeOpened}</div>
            )}
          </div>

          {tradeData.reflection && (
            <div className="bg-card border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Reflection</div>
              <p className="text-sm leading-relaxed">{tradeData.reflection}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MissedOppsSlide({ screenshots }: { screenshots: MissedOpp[] }) {
  const visible = screenshots.filter(s => s.screenshot_url);
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <h3 className="text-2xl font-bold">Missed Opportunities to Study</h3>
      </div>
      <p className="text-center text-muted-foreground">Review these setups you flagged — can you spot them next time?</p>

      {visible.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No missed opportunity screenshots found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((opp) => (
            <div key={opp.id} className="bg-card border rounded-xl overflow-hidden flex items-center justify-center p-4 min-h-[200px]">
              <ReadOnlyTradeImage
                screenshotUrl={opp.screenshot_url!}
                markers={opp.markers}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TodaysFocusSlide({ content }: { content: GeneratedContent }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 justify-center">
        <Target className="w-8 h-8 text-emerald-400" />
        <h3 className="text-2xl font-bold">Today's Focus</h3>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4 w-full">
        <p className="text-xl leading-relaxed font-medium">{content.todaysFocus}</p>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        One focused intention for today's session — keep this in mind before every trade.
      </p>
    </div>
  );
}

function MentalGameSlide({ content }: { content: GeneratedContent }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 justify-center">
        <Brain className="w-8 h-8 text-blue-400" />
        <h3 className="text-2xl font-bold">Mental Game</h3>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center space-y-4 w-full">
        <p className="text-lg leading-relaxed">{content.mentalGame}</p>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-primary">Now go trade your plan.</p>
        <p className="text-xs text-muted-foreground">This game plan was generated from your own words and data.</p>
      </div>
    </div>
  );
}

function NoAIKeySlide() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[400px] text-center">
      <Sparkles className="w-12 h-12 text-violet-400 opacity-50" />
      <h3 className="text-xl font-bold">AI Insights Not Configured</h3>
      <p className="text-muted-foreground">
        To enable AI-generated pattern insights and focus recommendations, add your free Groq API key to your <code className="bg-muted px-1 rounded text-sm">.env</code> file:
      </p>
      <div className="bg-muted rounded-lg p-4 font-mono text-sm text-left w-full">
        VITE_GROQ_API_KEY=your_key_here
      </div>
      <p className="text-xs text-muted-foreground">
        Get a free key at <span className="text-primary">console.groq.com</span> — no credit card required.
      </p>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const AIGamePlanDialog = ({ open, onOpenChange, date }: AIGamePlanDialogProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [bestTrade, setBestTrade] = useState<TradeToStudy | null>(null);
  const [worstTrade, setWorstTrade] = useState<TradeToStudy | null>(null);
  const [missedOpps, setMissedOpps] = useState<MissedOpp[]>([]);
  const [hasAIKey] = useState(() => !!import.meta.env.VITE_GROQ_API_KEY);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setIsLoading(true);
      setStats(null);
      setGeneratedContent(null);
      setBestTrade(null);
      setWorstTrade(null);
      setMissedOpps([]);
      loadAndGenerate();
    }
  }, [open, date]);

  const loadAndGenerate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const sevenDaysAgo = format(subDays(date, 7), "yyyy-MM-dd");
    const today = format(date, "yyyy-MM-dd");

    // Fetch all data in parallel
    const [tradesRes, reviewsRes, focusRes] = await Promise.all([
      supabase
        .from("trades")
        .select("id, trade_date, profit, outcome, symbol, pair, buy_sell, time_opened, strategy_type")
        .eq("user_id", user.id)
        .gte("trade_date", sevenDaysAgo)
        .lt("trade_date", today)
        .order("trade_date", { ascending: false }),
      supabase
        .from("daily_reviews")
        .select("id, review_date, total_pl, what_went_well, lessons_learned, missed_opportunities, missed_opportunities_data")
        .eq("user_id", user.id)
        .gte("review_date", sevenDaysAgo)
        .lt("review_date", today)
        .order("review_date", { ascending: false }),
      supabase
        .from("daily_improvement_focus")
        .select("focus_text, execution_rating")
        .eq("user_id", user.id)
        .gte("review_date", sevenDaysAgo)
        .lt("review_date", today)
        .not("execution_rating", "is", null),
    ]);

    const trades = tradesRes.data || [];
    const reviews = reviewsRes.data || [];
    const focusData = focusRes.data || [];

    // Fetch trade review slides for all reviews
    const reviewIds = reviews.map(r => r.id);
    let tradeSlides: any[] = [];
    if (reviewIds.length > 0) {
      const { data: slides } = await supabase
        .from("trade_review_slides")
        .select("*")
        .in("daily_review_id", reviewIds);
      tradeSlides = slides || [];
    }

    // ── Compute stats ──────────────────────────────────────────────────────
    const wins = trades.filter(t => t.outcome === "Win").length;
    const losses = trades.filter(t => t.outcome === "Loss").length;
    const totalPL = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    // Best setup by win rate (min 2 trades)
    const setupMap = new Map<string, { wins: number; total: number }>();
    trades.forEach(t => {
      if (!t.strategy_type) return;
      const entry = setupMap.get(t.strategy_type) || { wins: 0, total: 0 };
      entry.total++;
      if (t.outcome === "Win") entry.wins++;
      setupMap.set(t.strategy_type, entry);
    });
    let bestSetup: string | null = null;
    let bestSetupRate = 0;
    setupMap.forEach((v, k) => {
      if (v.total >= 2) {
        const rate = v.wins / v.total;
        if (rate > bestSetupRate) { bestSetupRate = rate; bestSetup = k; }
      }
    });

    const avgExec = focusData.length > 0
      ? focusData.reduce((s, f) => s + (f.execution_rating || 0), 0) / focusData.length
      : null;

    const computedStats: PerformanceStats = {
      winRate,
      totalPL,
      totalTrades: trades.length,
      wins,
      losses,
      bestDayPL: null,
      worstDayPL: null,
      bestSetup,
      daysReviewed: reviews.length,
      avgExecutionRating: avgExec,
    };
    setStats(computedStats);

    // ── Find best & worst trades with screenshots ──────────────────────────
    const slidesByTradeId = new Map(tradeSlides.map(s => [s.trade_id, s]));
    const reviewDateByReviewId = new Map(reviews.map(r => [r.id, r.review_date]));

    // Map trade_id → review_date via trade_review_slides
    const tradesWithSlides = trades
      .map(t => {
        const slide = slidesByTradeId.get(t.id);
        if (!slide) return null;
        const slots: ScreenshotSlot[] = Array.isArray(slide.screenshot_slots) ? slide.screenshot_slots as any : [];
        const markers: Marker[] = Array.isArray(slide.markers) ? slide.markers as any : [];
        const hasImage = slide.screenshot_url || slots.some((s: ScreenshotSlot) => s.screenshot_url);
        if (!hasImage) return null;
        return {
          trade: t,
          slide,
          slots,
          markers,
          reviewDate: reviewDateByReviewId.get(slide.daily_review_id) || t.trade_date,
        };
      })
      .filter(Boolean) as {
        trade: (typeof trades)[0];
        slide: any;
        slots: ScreenshotSlot[];
        markers: Marker[];
        reviewDate: string;
      }[];

    if (tradesWithSlides.length > 0) {
      const sorted = [...tradesWithSlides].sort((a, b) => (b.trade.profit || 0) - (a.trade.profit || 0));
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      setBestTrade({
        tradeId: best.trade.id,
        symbol: best.trade.symbol || best.trade.pair || "Unknown",
        outcome: best.trade.outcome,
        profit: best.trade.profit,
        timeOpened: best.trade.time_opened,
        reflection: best.slide.reflection || "",
        screenshotUrl: best.slide.screenshot_url,
        markers: best.markers,
        screenshotSlots: best.slots.length > 0 ? best.slots : undefined,
        reviewDate: best.reviewDate,
        reason: "Your best trade this week — study what you did right.",
      });

      if (worst.trade.id !== best.trade.id) {
        setWorstTrade({
          tradeId: worst.trade.id,
          symbol: worst.trade.symbol || worst.trade.pair || "Unknown",
          outcome: worst.trade.outcome,
          profit: worst.trade.profit,
          timeOpened: worst.trade.time_opened,
          reflection: worst.slide.reflection || "",
          screenshotUrl: worst.slide.screenshot_url,
          markers: worst.markers,
          screenshotSlots: worst.slots.length > 0 ? worst.slots : undefined,
          reviewDate: worst.reviewDate,
          reason: "Your worst trade this week — understand the mistake before today.",
        });
      }
    }

    // ── Collect missed opportunity screenshots ─────────────────────────────
    const allMissed: MissedOpp[] = [];
    reviews.forEach(r => {
      const data = r.missed_opportunities_data;
      if (Array.isArray(data)) {
        (data as any[]).forEach((item: any) => {
          if (item.screenshot_url) {
            allMissed.push({
              id: item.id || Math.random().toString(),
              screenshot_url: item.screenshot_url,
              markers: Array.isArray(item.markers) ? item.markers : [],
            });
          }
        });
      }
    });
    setMissedOpps(allMissed.slice(0, 4)); // max 4

    // ── Call Groq AI ───────────────────────────────────────────────────────
    if (hasAIKey) {
      try {
        const reviewText = reviews
          .map(r => {
            const lines: string[] = [`[${r.review_date}]`];
            if (r.what_went_well) lines.push(`What went well: ${r.what_went_well}`);
            if (r.lessons_learned) lines.push(`Lessons learned: ${r.lessons_learned}`);
            if (r.missed_opportunities) lines.push(`Missed: ${r.missed_opportunities}`);
            // Trade reflections for this review
            const reviewSlides = tradeSlides.filter(s => s.daily_review_id === r.id && s.reflection);
            reviewSlides.forEach(s => {
              lines.push(`Trade reflection: ${s.reflection}`);
            });
            return lines.join("\n");
          })
          .join("\n\n");

        const focusText = focusData
          .map(f => `Focus: "${f.focus_text}" — Rating: ${f.execution_rating}/5`)
          .join("\n");

        const prompt = `You are an expert professional trading coach. Analyse this trader's recent data and provide personalised insights.

PERFORMANCE (last 7 days):
- Trades: ${trades.length}, Wins: ${wins}, Losses: ${losses}, Win rate: ${winRate.toFixed(0)}%
- Total P&L: $${totalPL.toFixed(2)}
- Best setup: ${bestSetup || "Not enough data"}
- Days reviewed: ${reviews.length}

FOCUS EXECUTION HISTORY:
${focusText || "No focus data available"}

REVIEW NOTES & TRADE REFLECTIONS:
${reviewText || "No review notes available"}

Based on this data, respond with ONLY valid JSON (no markdown, no extra text):
{
  "pattern_title": "Short title for the main pattern identified (max 6 words)",
  "pattern_insight": "2-3 sentences describing the main recurring pattern or weakness from the review notes. Be specific to what they actually wrote.",
  "todays_focus": "One specific, actionable focus for today's trading session (2-3 sentences). Be direct and concrete.",
  "mental_game": "A short, honest mindset note based on their patterns (2-3 sentences). Be encouraging but real."
}`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const raw = json.choices?.[0]?.message?.content || "";
          // Strip any markdown code fences if present
          const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed: GeneratedContent = JSON.parse(cleaned);
          setGeneratedContent(parsed);
        }
      } catch {
        // AI failed silently — stats slides still show
      }
    }

    setIsLoading(false);
  };

  // ── Build slide list dynamically ──────────────────────────────────────────
  type SlideType =
    | "title"
    | "stats"
    | "ai_insights"
    | "best_trade"
    | "worst_trade"
    | "missed_opps"
    | "focus"
    | "mental_game"
    | "no_ai_key";

  const slides: SlideType[] = ["title"];
  if (!isLoading) {
    if (stats) slides.push("stats");
    if (generatedContent) {
      slides.push("ai_insights");
    } else if (!hasAIKey) {
      slides.push("no_ai_key");
    }
    if (bestTrade) slides.push("best_trade");
    if (worstTrade) slides.push("worst_trade");
    if (missedOpps.some(m => m.screenshot_url)) slides.push("missed_opps");
    if (generatedContent) {
      slides.push("focus");
      slides.push("mental_game");
    }
  }

  const totalSlides = slides.length;

  const getSlideName = (type: SlideType) => {
    if (type === "title") return "AI Game Plan";
    if (type === "stats") return "Performance Snapshot";
    if (type === "ai_insights") return "Pattern Detected";
    if (type === "best_trade") return "Best Trade to Study";
    if (type === "worst_trade") return "Worst Trade to Study";
    if (type === "missed_opps") return "Missed Opportunities";
    if (type === "focus") return "Today's Focus";
    if (type === "mental_game") return "Mental Game";
    return "AI Insights";
  };

  const renderSlide = (type: SlideType) => {
    if (type === "title") return <TitleSlide date={date} isLoading={isLoading} />;
    if (type === "stats" && stats) return <StatsSlide stats={stats} />;
    if (type === "ai_insights" && generatedContent) return <AIInsightsSlide content={generatedContent} />;
    if (type === "best_trade" && bestTrade) return <TradeStudySlide tradeData={bestTrade} />;
    if (type === "worst_trade" && worstTrade) return <TradeStudySlide tradeData={worstTrade} />;
    if (type === "missed_opps") return <MissedOppsSlide screenshots={missedOpps} />;
    if (type === "focus" && generatedContent) return <TodaysFocusSlide content={generatedContent} />;
    if (type === "mental_game" && generatedContent) return <MentalGameSlide content={generatedContent} />;
    if (type === "no_ai_key") return <NoAIKeySlide />;
    return null;
  };

  const currentType = slides[currentSlide] || "title";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-violet-500/20">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{getSlideName(currentType)}</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Generating..." : `Slide ${currentSlide + 1} of ${totalSlides}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderSlide(currentType)}</div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={() => setCurrentSlide(p => Math.max(0, p - 1))}
            disabled={currentSlide === 0 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => !isLoading && setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? "bg-violet-400" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentSlide(p => Math.min(totalSlides - 1, p + 1))}
            disabled={currentSlide === totalSlides - 1 || isLoading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
