import { useState } from "react";
import { Trophy, Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import type { Goal } from "@/pages/Goals";

interface Props {
  goals: Goal[];
  onToggle: (id: string, current: boolean) => void;
  onAdd: (category: string, text: string) => void;
  onDelete: (id: string) => void;
}

export const MilestoneGoals = ({ goals, onToggle, onAdd, onDelete }: Props) => {
  const [newText, setNewText] = useState("");

  const milestoneGoals = goals.filter(g => g.category === "Milestone");
  const completed = milestoneGoals.filter(g => g.is_completed).length;
  const total = milestoneGoals.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd("Milestone", newText);
    setNewText("");
  };

  return (
    <div className="hud-glass rounded-xl overflow-hidden">
      <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Milestone Goals</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground font-medium">
            {completed}/{total}
          </span>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-5 pt-3">
          <div className="h-1.5 rounded-full bg-muted/30 border border-muted-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%`, boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" }}
            />
          </div>
        </div>
      )}

      <div className="p-4 space-y-1 max-h-[300px] overflow-y-auto hud-scrollbar">
        <AnimatePresence>
          {milestoneGoals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
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
              {goal.is_completed && <Check className="h-3.5 w-3.5 text-success shrink-0" />}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => onDelete(goal.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {milestoneGoals.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-4">No milestone goals yet</p>
        )}
      </div>

      {/* Add */}
      <div className="p-4 border-t border-border/20">
        <div className="flex gap-2">
          <Input
            placeholder="Add milestone goal..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
            className="text-sm bg-muted/10 border-border/30"
          />
          <Button onClick={handleAdd} size="icon" className="shrink-0 premium-button rounded-lg">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
