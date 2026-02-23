import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, Flame, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfDay } from "date-fns";

interface Goal {
  id: string;
  category: string;
  text: string;
  is_completed: boolean;
}

interface HabitLog {
  id: string;
  goal_id: string;
  log_date: string;
  is_completed: boolean;
}

interface HabitTrackerProps {
  goals: Goal[];
}

const DAYS_TO_SHOW = 7;

export const HabitTracker = ({ goals }: HabitTrackerProps) => {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Filter to only Implement and Avoid goals
  const trackedGoals = useMemo(
    () => goals.filter(g => g.category === "Implement" || g.category === "Avoid"),
    [goals]
  );

  const days = useMemo(() => {
    const result = [];
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      result.push(subDays(startOfDay(new Date()), i));
    }
    return result;
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId || trackedGoals.length === 0) return;
    fetchLogs();
  }, [userId, trackedGoals]);

  const fetchLogs = async () => {
    if (!userId) return;
    const startDate = format(days[0], "yyyy-MM-dd");
    const endDate = format(days[days.length - 1], "yyyy-MM-dd");

    const { data } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate);

    if (data) setLogs(data as HabitLog[]);
  };

  const isChecked = (goalId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return logs.some(l => l.goal_id === goalId && l.log_date === dateStr && l.is_completed);
  };

  const toggleHabit = async (goalId: string, date: Date) => {
    if (!userId) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = logs.find(l => l.goal_id === goalId && l.log_date === dateStr);

    if (existing) {
      if (existing.is_completed) {
        // Uncheck - delete the log
        await supabase.from("habit_logs").delete().eq("id", existing.id);
      } else {
        await supabase.from("habit_logs").update({ is_completed: true }).eq("id", existing.id);
      }
    } else {
      await supabase.from("habit_logs").insert({
        user_id: userId,
        goal_id: goalId,
        log_date: dateStr,
        is_completed: true,
      });
    }
    fetchLogs();
  };

  // Calculate streak for a goal (consecutive days completed ending today or yesterday)
  const getStreak = (goalId: string) => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (isChecked(goalId, days[i])) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Overall completion rate for today
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCompleted = trackedGoals.filter(g =>
    logs.some(l => l.goal_id === g.id && l.log_date === todayStr && l.is_completed)
  ).length;
  const todayRate = trackedGoals.length > 0 ? Math.round((todayCompleted / trackedGoals.length) * 100) : 0;

  if (trackedGoals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-success/10">
              <CalendarCheck className="h-5 w-5 text-success" />
            </div>
            Daily Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No habits to track yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add goals under "Implement" or "Avoid" to start tracking daily habits
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-success/10">
              <CalendarCheck className="h-5 w-5 text-success" />
            </div>
            Daily Habits
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-success/10 text-success font-medium">
              {todayRate}% today
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Day headers */}
        <div className="grid items-center gap-1 mb-2" style={{ gridTemplateColumns: `1fr repeat(${DAYS_TO_SHOW}, 36px) 44px` }}>
          <div />
          {days.map((day) => {
            const isToday = format(day, "yyyy-MM-dd") === todayStr;
            return (
              <div key={day.toISOString()} className="text-center">
                <span className={`text-[10px] uppercase tracking-wider ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {format(day, "EEE")}
                </span>
                <div className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
          <div className="text-center">
            <Flame className="h-3.5 w-3.5 text-amber-500 mx-auto" />
          </div>
        </div>

        {/* Habit rows */}
        {trackedGoals.map((goal, index) => {
          const streak = getStreak(goal.id);
          const categoryColor = goal.category === "Implement" ? "text-emerald-400" : "text-rose-400";
          const categoryBg = goal.category === "Implement" ? "bg-emerald-500/10" : "bg-rose-500/10";

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid items-center gap-1 py-2 rounded-lg hover:bg-accent/20 transition-colors px-1"
              style={{ gridTemplateColumns: `1fr repeat(${DAYS_TO_SHOW}, 36px) 44px` }}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${categoryBg} ${categoryColor} font-semibold shrink-0`}>
                  {goal.category === "Implement" ? "DO" : "NO"}
                </span>
                <span className="text-sm text-foreground truncate">{goal.text}</span>
              </div>

              {days.map((day) => {
                const checked = isChecked(goal.id, day);
                const isFuture = day > new Date();

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isFuture && toggleHabit(goal.id, day)}
                    disabled={isFuture}
                    className="flex items-center justify-center h-8 w-8 mx-auto rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    {checked ? (
                      <CheckCircle2 className="h-5 w-5 text-success drop-shadow-[0_0_6px_hsl(163_100%_50%/0.5)]" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-muted-foreground/60" />
                    )}
                  </button>
                );
              })}

              <div className="text-center">
                <span className={`text-sm font-bold ${streak > 0 ? 'text-amber-500' : 'text-muted-foreground/30'}`}>
                  {streak > 0 ? `${streak}🔥` : '—'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
