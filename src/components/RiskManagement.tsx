import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RiskRule {
  id: string;
  rule_text: string;
  rule_order: number;
  is_active: boolean;
  strategy_id?: string | null;
}

interface Strategy {
  id: string;
  name: string;
  type: string;
}

export const RiskManagement = () => {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("default");
  const [newRule, setNewRule] = useState("");
  const [newStrategyName, setNewStrategyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStrategies();
    fetchRules();
  }, [selectedStrategyId]);

  const fetchStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trading_strategies")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "risk_management")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load strategies", error);
      return;
    }

    if (data) {
      setStrategies(data);
      if (data.length > 0 && selectedStrategyId === "default") {
        setSelectedStrategyId(data[0].id);
      }
    }
  };

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("risk_management_rules")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (selectedStrategyId && selectedStrategyId !== "default") {
      query = query.eq("strategy_id", selectedStrategyId);
    } else if (selectedStrategyId === "default") {
      query = query.is("strategy_id", null);
    }

    const { data, error } = await query.order("rule_order", { ascending: true });

    if (error) {
      toast.error("Failed to load risk management rules");
      return;
    }

    if (data) {
      setRules(data);
    }
  };

  const createStrategy = async () => {
    if (!newStrategyName.trim()) {
      toast.error("Please enter a strategy name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a strategy");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("trading_strategies")
        .insert({
          user_id: user.id,
          name: newStrategyName.trim(),
          type: "risk_management",
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Strategy creation error:", error);
        // Check if it's a unique constraint violation
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          toast.error("A strategy with this name already exists. Please choose a different name.");
        } else {
          toast.error(`Failed to create strategy: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      toast.success("Strategy created successfully");
      setNewStrategyName("");
      fetchStrategies();
      if (data) {
        setSelectedStrategyId(data.id);
      }
    } catch (err: any) {
      console.error("Unexpected error creating strategy:", err);
      toast.error(`Failed to create strategy: ${err.message || 'Unknown error'}`);
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("trading_strategies")
      .update({ is_active: false })
      .eq("id", strategyId);

    if (error) {
      toast.error("Failed to delete strategy");
      return;
    }

    toast.success("Strategy deleted");
    fetchStrategies();
    if (selectedStrategyId === strategyId) {
      setSelectedStrategyId("default");
    }
  };

  const addRule = async () => {
    if (!newRule.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const maxOrder = rules.length > 0 ? Math.max(...rules.map(r => r.rule_order)) : 0;

    const ruleData: any = {
      user_id: user.id,
      rule_text: newRule.trim(),
      rule_order: maxOrder + 1,
      is_active: true,
    };

    if (selectedStrategyId && selectedStrategyId !== "default") {
      ruleData.strategy_id = selectedStrategyId;
    }

    const { error } = await supabase
      .from("risk_management_rules")
      .insert(ruleData);

    if (error) {
      toast.error("Failed to add rule");
      return;
    }

    toast.success("Rule added");
    setNewRule("");
    setIsAdding(false);
    fetchRules();
  };

  const removeRule = async (id: string) => {
    const { error } = await supabase
      .from("risk_management_rules")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove rule");
      return;
    }

    toast.success("Rule removed");
    fetchRules();
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Risk Management</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedStrategyId} onValueChange={setSelectedStrategyId}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {strategies.map((strategy) => (
                <SelectItem key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Strategy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Strategy</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Strategy name"
                        value={newStrategyName}
                        onChange={(e) => setNewStrategyName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            createStrategy();
                          }
                        }}
                      />
                      <Button onClick={createStrategy} className="w-full">
                        Create Strategy
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </SelectContent>
          </Select>
          {selectedStrategyId !== "default" && strategies.find(s => s.id === selectedStrategyId) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm("Delete this strategy? All rules will be moved to Default.")) {
                  deleteStrategy(selectedStrategyId);
                }
              }}
              className="h-9 w-9"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter risk management rule..."
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addRule();
              }
            }}
          />
          <Button onClick={addRule} size="sm">
            Add
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No risk management rules yet. Add rules to protect your capital!
          </p>
        ) : (
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-primary mr-2">{index + 1}.</span>
              <span className="flex-1">{rule.rule_text}</span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeRule(rule.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
