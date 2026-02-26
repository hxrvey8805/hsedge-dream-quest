import { useState } from "react";
import { ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Goal, HabitLog } from "@/pages/Goals";
import { format, subDays } from "date-fns";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
  onToggle: (id: string, current: boolean) => void;
  onAdd: (category: string, text: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  { key: "Learn", color: "from-primary/30 to-primary/5", accent: "text-primary", dotBg: "bg-primary/20" },
  { key: "Implement", color: "from-success/30 to-success/5", accent: "text-success", dotBg: "bg-success/20" },
  { key: "Backtest", color: "from-[hsl(270,70%,55%)]/30 to-[hsl(270,70%,55%)]/5", accent: "text-[hsl(270,70%,55%)]", dotBg: "bg-[hsl(270,70%,55%)]/20" },
  { key: "Avoid", color: "from-destructive/30 to-destructive/5", accent: "text-destructive", dotBg: "bg-destructive/20" },
];

export const GoalsCategoriesCard = ({ goals, habitLogs, onToggle, onAdd, onDelete }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.key)));
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState("Learn");

  const toggle = (cat: string) => {
    const n = new Set(expanded);
    n.has(cat) ? n.delete(cat) : n.add(cat);
    setExpanded(n);
  };

  // Get consistency dots for a goal (last 4 days)
  const getConsistencyDots = (goalId: string) => {
    const dots = [];
    for (let i = 3; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const log = habitLogs.find(l => l.goal_id === goalId && l.log_date === date);
      if (log?.is_completed) dots.push("green");
      else if (log) dots.push("amber");
      else dots.push("grey");
    }
    return dots;
  };

  const goalsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = goals.filter(g => g.category === cat.key);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    <div className="hud-glass rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-5 pb-3 border-b border-border/20">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Goal Categories</h3>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px]">
        {CATEGORIES.map(cat => {
          const catGoals = goalsByCategory[cat.key];
          const completed = catGoals.filter(g => g.is_completed).length;
          const pct = catGoals.length > 0 ? Math.round((completed / catGoals.length) * 100) : 0;
          const isOpen = expanded.has(cat.key);

          return (
            <div key={cat.key}>
              <button
                onClick={() => toggle(cat.key)}
                className={`w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${cat.color} hover:brightness-125 transition-all`}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className={`h-4 w-4 ${cat.accent}`} /> : <ChevronRight className={`h-4 w-4 ${cat.accent}`} />}
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{cat.key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground font-medium">
                    {completed}/{catGoals.length}
                  </span>
                  <span className={`text-xs font-bold ${cat.accent}`}>{pct}%</span>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 space-y-1">
                      {catGoals.map((goal, i) => {
                        const dots = getConsistencyDots(goal.id);
                        return (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 group px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors"
                          >
                            <Checkbox
                              checked={goal.is_completed}
                              onCheckedChange={() => onToggle(goal.id, goal.is_completed)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30"
                            />
                            <span className={`flex-1 text-sm ${goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {goal.text}
                            </span>
                            {/* Consistency dots */}
                            <div className="flex gap-1 shrink-0">
                              {dots.map((d, j) => (
                                <div
                                  key={j}
                                  className={`w-2 h-2 rounded-full ${
                                    d === "green" ? "bg-success" : d === "amber" ? "bg-warning" : "bg-muted/40"
                                  }`}
                                />
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => onDelete(goal.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        );
                      })}
                      {catGoals.length === 0 && (
                        <p className="text-xs text-muted-foreground italic px-3 py-2">No goals yet</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Goal */}
      <div className="p-4 border-t border-border/20">
        <div className="flex gap-2">
          <select
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground focus:ring-1 focus:ring-primary/50 outline-none"
          >
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
          </select>
          <Input
            placeholder="Add new goal..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { onAdd(newCat, newText); setNewText(""); } }}
            className="text-sm bg-muted/10 border-border/30"
          />
          <Button
            onClick={() => { onAdd(newCat, newText); setNewText(""); }}
            size="icon"
            className="shrink-0 premium-button rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
