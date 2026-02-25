import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Star, Flame, Target, RotateCcw, Calendar } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FocusEntry {
  id: string;
  focus_text: string;
  review_date: string;
  execution_rating: number | null;
  execution_notes: string | null;
}

export const ImprovementJournal = () => {
  const [entries, setEntries] = useState<FocusEntry[]>([]);
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

  // Stats
  const ratedEntries = entries.filter(e => e.execution_rating !== null);
  const avgRating = ratedEntries.length > 0
    ? ratedEntries.reduce((s, e) => s + (e.execution_rating ?? 0), 0) / ratedEntries.length
    : 0;

  // Streak calc
  let currentStreak = 0;
  for (const e of entries) {
    if (e.execution_rating !== null && e.execution_rating >= 3) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let tempStreak = 0;
  for (const e of entries) {
    if (e.execution_rating !== null && e.execution_rating >= 3) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Unfinished business (last 14 days, rated < 3)
  const fourteenDaysAgo = subDays(new Date(), 14).toISOString().split("T")[0];
  const unfinished = entries.filter(
    e => e.execution_rating !== null && e.execution_rating < 3 && e.review_date >= fourteenDaysAgo
  );

  // Heatmap: last 30 days
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
    const entry = entries.find(e => e.review_date === date);
    return { date, entry };
  });

  const getHeatmapColor = (entry: FocusEntry | undefined) => {
    if (!entry) return "bg-muted/30";
    if (entry.execution_rating === null) return "bg-primary/20";
    if (entry.execution_rating >= 3) return "bg-accent";
    return "bg-destructive/60";
  };

  const getHeatmapLabel = (entry: FocusEntry | undefined) => {
    if (!entry) return "No focus set";
    if (entry.execution_rating === null) return "Not yet rated";
    return `Rated ${entry.execution_rating}/5`;
  };

  if (loading) return null;
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            1% Improvement Journal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Flame className="h-4 w-4 text-accent" />} label="Current Streak" value={`${currentStreak}`} />
            <StatCard icon={<Target className="h-4 w-4 text-primary" />} label="Best Streak" value={`${longestStreak}`} />
            <StatCard icon={<Star className="h-4 w-4 text-yellow-500" />} label="Avg Rating" value={avgRating.toFixed(1)} />
            <StatCard icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Total Set" value={`${entries.length}`} />
          </div>

          {/* Heatmap */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last 30 Days</p>
            <TooltipProvider>
              <div className="flex gap-1 flex-wrap">
                {heatmapDays.map(({ date, entry }) => (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-5 h-5 rounded-sm ${getHeatmapColor(entry)} transition-colors cursor-default`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{format(parseISO(date), "MMM d")}</p>
                      <p>{getHeatmapLabel(entry)}</p>
                      {entry && <p className="text-muted-foreground truncate max-w-[200px]">{entry.focus_text}</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted/30" /> No focus</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/20" /> Unrated</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent" /> Achieved</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive/60" /> Missed</span>
            </div>
          </div>

          {/* Unfinished Business */}
          {unfinished.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Unfinished Business
              </p>
              <div className="space-y-2">
                {unfinished.map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex gap-0.5 shrink-0 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= (e.execution_rating ?? 0) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{e.focus_text}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(e.review_date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">History</p>
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2 pr-2">
                {entries.slice(0, 20).map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex gap-0.5 shrink-0 mt-0.5">
                      {e.execution_rating !== null ? (
                        [1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3 w-3 ${s <= (e.execution_rating ?? 0)
                            ? (e.execution_rating ?? 0) >= 3 ? "fill-accent text-accent" : "fill-destructive text-destructive"
                            : "text-muted-foreground/30"}`} />
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unrated</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{e.focus_text}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{format(parseISO(e.review_date), "MMM d, yyyy")}</p>
                        {e.execution_notes && (
                          <p className="text-xs text-muted-foreground truncate">— {e.execution_notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
    <div className="flex items-center justify-center gap-1.5 mb-1">{icon}</div>
    <p className="text-lg font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
