import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, X, Flame } from "lucide-react";

interface FocusData {
  id: string;
  focus_text: string;
  review_date: string;
}

interface PreviousRated {
  execution_rating: number;
}

export const ImprovementFocusBanner = () => {
  const [focus, setFocus] = useState<FocusData | null>(null);
  const [streak, setStreak] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousMissed, setPreviousMissed] = useState(false);

  useEffect(() => {
    fetchFocusAndStreak();
  }, []);

  const fetchFocusAndStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get most recent unrated focus
    const { data: latestFocus } = await supabase
      .from("daily_improvement_focus")
      .select("id, focus_text, review_date")
      .eq("user_id", user.id)
      .is("execution_rating", null)
      .order("review_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    setFocus(latestFocus);

    // Check if previous rated focus was missed
    const { data: prevRated } = await supabase
      .from("daily_improvement_focus")
      .select("execution_rating")
      .eq("user_id", user.id)
      .not("execution_rating", "is", null)
      .order("review_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prevRated && (prevRated.execution_rating ?? 0) < 3) {
      setPreviousMissed(true);
    }

    // Calculate streak: consecutive rated >= 3
    const { data: ratings } = await supabase
      .from("daily_improvement_focus")
      .select("execution_rating, review_date")
      .eq("user_id", user.id)
      .not("execution_rating", "is", null)
      .order("review_date", { ascending: false })
      .limit(30);

    if (ratings) {
      let count = 0;
      for (const row of ratings) {
        if ((row.execution_rating ?? 0) >= 3) {
          count++;
        } else {
          break;
        }
      }
      setStreak(count);
    }

    setLoading(false);
  };

  if (loading || dismissed || (!focus && streak === 0)) return null;

  return (
    <Card className="relative p-4 border-primary/20 bg-primary/5 mb-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={() => setDismissed(true)}
      >
        <X className="w-3.5 h-3.5" />
      </Button>

      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black text-primary">1%</span>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {focus && (
            <p className="text-sm text-foreground font-medium truncate">
              <span className="text-muted-foreground">Today's focus: </span>
              {focus.focus_text}
            </p>
          )}
          {previousMissed && (
            <p className="text-xs text-amber-500">
              ⚠ Yesterday's focus was not fully achieved — consider re-committing
            </p>
          )}
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{streak}</span>
            <span className="text-xs text-muted-foreground">streak</span>
          </div>
        )}
      </div>
    </Card>
  );
};
