import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Flame, Star, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface FocusEntry {
  id: string;
  focus_text: string;
  review_date: string;
  execution_rating: number | null;
  execution_notes: string | null;
}

export const DailyImprovementBanner = () => {
  const [entries, setEntries] = useState<FocusEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("daily_improvement_focus")
      .select("id, focus_text, review_date, execution_rating, execution_notes")
      .eq("user_id", user.id)
      .order("review_date", { ascending: false })
      .limit(60);

    setEntries(data ?? []);
    setLoading(false);
  };

  if (loading) return null;

  // Current streak (consecutive days with rating >= 3)
  let currentStreak = 0;
  for (const e of entries) {
    if (e.execution_rating !== null && e.execution_rating >= 3) currentStreak++;
    else break;
  }

  // 7-day avg execution score
  const last7 = entries.filter(e => {
    const sevenAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
    return e.review_date >= sevenAgo && e.execution_rating !== null;
  });
  const avgScore = last7.length > 0
    ? Math.round((last7.reduce((s, e) => s + ((e.execution_rating ?? 0) / 5) * 100, 0)) / last7.length)
    : 0;

  // Today's focus
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayFocus = entries.find(e => e.review_date === todayStr);

  return (
    <div className="hud-glass rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-4 flex-wrap">
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">1% Daily Improvement</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-success" />
            <span className="text-sm font-bold text-success">{currentStreak}</span>
            <span className="text-[10px] text-muted-foreground">streak</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-primary">{avgScore}%</span>
            <span className="text-[10px] text-muted-foreground">7d avg</span>
          </div>

          {todayFocus && (
            <div className="hidden sm:flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground shrink-0">Focus:</span>
              <span className="text-xs text-foreground/80 truncate">{todayFocus.focus_text}</span>
            </div>
          )}
        </div>

        {/* View Journal button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
        >
          {expanded ? "Hide" : "View"} Journal
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Expanded Journal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/20 pt-3">
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No improvement focuses set yet. Complete a daily review to get started.</p>
              ) : (
                <ScrollArea className="max-h-[320px]">
                  <div className="space-y-2 pr-2">
                    {entries.map(e => (
                      <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors border border-transparent hover:border-border/30">
                        {/* Date */}
                        <div className="shrink-0 text-center min-w-[52px]">
                          <p className="text-[10px] text-muted-foreground uppercase">{format(parseISO(e.review_date), "MMM")}</p>
                          <p className="text-lg font-bold text-foreground leading-none">{format(parseISO(e.review_date), "d")}</p>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{e.focus_text}</p>
                          {e.execution_notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{e.execution_notes}"</p>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="shrink-0">
                          {e.execution_rating !== null ? (
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${
                                    s <= (e.execution_rating ?? 0)
                                      ? (e.execution_rating ?? 0) >= 3
                                        ? "fill-success text-success"
                                        : "fill-destructive text-destructive"
                                      : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/50 italic">Unrated</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
