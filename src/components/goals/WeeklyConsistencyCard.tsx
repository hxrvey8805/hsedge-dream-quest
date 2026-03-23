import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { X, RotateCcw } from "lucide-react";
import type { Goal, HabitLog } from "@/pages/Goals";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
  onToggleHabit: (goalId: string, dateStr: string) => void;
  skippedDays: string[];
  onSkipDay: (dateStr: string) => void;
  onRestoreDay: (dateStr: string) => void;
}

export const WeeklyConsistencyCard = ({ goals, habitLogs, onToggleHabit, skippedDays, onSkipDay, onRestoreDay }: Props) => {
  const trackedGoals = goals.filter(g => g.category === "Implement" || g.category === "Avoid");

  const allDays = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      result.push(subDays(new Date(), i));
    }
    return result.slice(-6);
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Active days = days not skipped
  const activeDays = allDays.filter(day => !skippedDays.includes(format(day, "yyyy-MM-dd")));

  const isChecked = (goalId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return habitLogs.some(l => l.goal_id === goalId && l.log_date === dateStr && l.is_completed);
  };

  const dailyRates = allDays.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    if (skippedDays.includes(dateStr)) return null;
    const followed = trackedGoals.filter(g =>
      habitLogs.some(l => l.goal_id === g.id && l.log_date === dateStr && l.is_completed)
    ).length;
    return trackedGoals.length > 0 ? Math.round((followed / trackedGoals.length) * 100) : 0;
  });

  const totalFollowed = activeDays.reduce((sum, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return sum + trackedGoals.filter(g =>
      habitLogs.some(l => l.goal_id === g.id && l.log_date === dateStr && l.is_completed)
    ).length;
  }, 0);
  const totalOpportunities = activeDays.length * trackedGoals.length;
  const avgRate = totalOpportunities > 0 ? Math.round((totalFollowed / totalOpportunities) * 100) : 0;

  return (
    <div className="hud-glass rounded-xl overflow-hidden">
      <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Weekly Consistency</h3>
        <span className="text-lg font-bold text-success hud-neon-text" style={{ textShadow: "0 0 8px hsl(var(--success) / 0.4)" }}>
          {avgRate}%
        </span>
      </div>

      <div className="p-4">
        {trackedGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Add Implement or Avoid goals to track consistency</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-3 pr-3 min-w-[140px]" />
                  {allDays.map((day, i) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = dateStr === todayStr;
                    const isSkipped = skippedDays.includes(dateStr);
                    return (
                      <th key={i} className="text-center pb-3 px-1 min-w-[40px] relative group">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] uppercase tracking-wider font-medium ${isSkipped ? "text-muted-foreground/40 line-through" : isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {isToday ? "TODAY" : format(day, "EEE").toUpperCase()}
                          </span>
                          {isSkipped ? (
                            <button
                              onClick={() => onRestoreDay(dateStr)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted/30"
                              title="Restore day"
                            >
                              <RotateCcw className="w-2.5 h-2.5 text-muted-foreground/60" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onSkipDay(dateStr)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/20"
                              title="Skip day (no trading)"
                            >
                              <X className="w-2.5 h-2.5 text-destructive/60" />
                            </button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {trackedGoals.map(goal => (
                  <tr key={goal.id} className="hover:bg-muted/10 transition-colors">
                    <td className="text-xs text-foreground/80 py-2.5 pr-3 truncate max-w-[160px]">{goal.text}</td>
                    {allDays.map((day, i) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const isSkipped = skippedDays.includes(dateStr);
                      const checked = isChecked(goal.id, day);
                      const isToday = dateStr === todayStr;

                      if (isSkipped) {
                        return (
                          <td key={i} className="text-center py-2.5 px-1">
                            <div className="w-3.5 h-3.5 mx-auto rounded-full bg-muted/10 border border-dashed border-muted-foreground/15" />
                          </td>
                        );
                      }

                      return (
                        <td key={i} className="text-center py-2.5 px-1">
                          <button
                            onClick={() => onToggleHabit(goal.id, dateStr)}
                            className="mx-auto block"
                          >
                            <div className={`w-3.5 h-3.5 rounded-full mx-auto transition-all ${
                              checked
                                ? "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]"
                                : isToday
                                  ? "bg-primary/30 border border-primary/50 shadow-[0_0_6px_hsl(var(--primary)/0.3)] hud-dot-pulse"
                                  : "bg-muted/20 border border-muted-foreground/20"
                            }`} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Daily percentages */}
            <div className="flex items-center mt-3 pt-3 border-t border-border/15">
              <div className="min-w-[140px] pr-3" />
              {dailyRates.map((rate, i) => (
                <div key={i} className="flex-1 text-center">
                  {rate === null ? (
                    <span className="text-[10px] font-medium text-muted-foreground/30">—</span>
                  ) : (
                    <span className={`text-[10px] font-medium ${rate >= 70 ? "text-success" : rate >= 40 ? "text-warning" : "text-destructive"}`}>
                      {rate}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
