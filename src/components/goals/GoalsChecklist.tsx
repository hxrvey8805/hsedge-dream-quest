import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Target, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  category: string;
  text: string;
  is_completed: boolean;
}

export const GoalsChecklist = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Learn");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Learn", "Implement", "Backtest", "Avoid"]));
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("goals_checklist")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error fetching goals", variant: "destructive" });
      return;
    }

    setGoals(data || []);
  };

  const toggleGoal = async (goalId: string, currentState: boolean) => {
    const { error } = await supabase
      .from("goals_checklist")
      .update({ is_completed: !currentState })
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error updating goal", variant: "destructive" });
      return;
    }

    fetchGoals();
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("goals_checklist")
      .insert({ user_id: user.id, category: newGoalCategory, text: newGoalText });

    if (error) {
      toast({ title: "Error adding goal", variant: "destructive" });
      return;
    }

    setNewGoalText("");
    fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from("goals_checklist")
      .delete()
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error deleting goal", variant: "destructive" });
      return;
    }

    fetchGoals();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = ["Learn", "Implement", "Backtest", "Avoid"];
  const goalsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          Goals Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(category => {
          const categoryGoals = goalsByCategory[category];
          const isExpanded = expandedCategories.has(category);
          const completedCount = categoryGoals.filter(g => g.is_completed).length;
          
          return (
            <div key={category} className="space-y-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-semibold text-foreground">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{categoryGoals.length}
                  </span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="space-y-2 pl-8 animate-in fade-in slide-in-from-top-2">
                  {categoryGoals.map(goal => (
                    <div key={goal.id} className="flex items-center gap-2 group p-2 rounded-md hover:bg-accent/30 transition-colors">
                      <Checkbox
                        checked={goal.is_completed}
                        onCheckedChange={() => toggleGoal(goal.id, goal.is_completed)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className={`flex-1 text-sm ${goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {goal.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="flex gap-2 pt-4 border-t border-border/50">
          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Input
            placeholder="Add new goal..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            className="text-sm"
          />
          <Button onClick={addGoal} size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
