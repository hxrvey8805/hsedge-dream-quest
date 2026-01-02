import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, X, GripVertical, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
}

export const RiskManagement = () => {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [newRule, setNewRule] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [newStrategyName, setNewStrategyName] = useState("");
  const [showAddStrategy, setShowAddStrategy] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    fetchRules();
  }, [selectedStrategy]);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query: any = supabase
      .from("risk_management_rules")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (selectedStrategy) {
      query = query.eq("strategy_id", selectedStrategy);
    } else {
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

  const fetchStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await (supabase
      .from("strategies")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true }) as any);

    if (!error && data) {
      setStrategies(data as Strategy[]);
    }
  };

  const handleAddStrategy = async () => {
    if (!newStrategyName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    const { data, error } = await supabase
      .from("strategies" as any)
      .insert({
        user_id: user.id,
        name: newStrategyName.trim(),
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Strategy insert error:", error);
      toast.error(`Failed to add strategy: ${error.message || "Unknown error"}`);
      return;
    }

    toast.success("Strategy added!");
    setNewStrategyName("");
    setShowAddStrategy(false);
    await fetchStrategies();
    if (data) {
      const newStrategyId = (data as any).id;
      setSelectedStrategy(newStrategyId);
      setIsAdding(true);
    }
  };

  const addRule = async () => {
    if (!newRule.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const maxOrder = rules.length > 0 ? Math.max(...rules.map(r => r.rule_order)) : 0;

    const { error } = await supabase
      .from("risk_management_rules")
      .insert({
        user_id: user.id,
        rule_text: newRule.trim(),
        rule_order: maxOrder + 1,
        is_active: true,
        strategy_id: selectedStrategy || null,
      });

    if (error) {
      toast.error("Failed to add rule");
      return;
    }

    toast.success("Rule added");
    setNewRule("");
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

  const handleStrategySelect = (strategyId: string | null) => {
    if (strategyId === "new") {
      setShowAddStrategy(true);
      return;
    }
    setSelectedStrategy(strategyId);
    setIsAdding(false);
  };

  const deleteStrategy = async (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("strategies")
      .update({ is_active: false })
      .eq("id", strategyId);

    if (error) {
      toast.error("Failed to delete strategy");
      return;
    }

    toast.success("Strategy deleted");
    if (selectedStrategy === strategyId) {
      setSelectedStrategy(null);
    }
    fetchStrategies();
  };

  const getSelectedStrategyName = () => {
    if (!selectedStrategy) return "General";
    const strategy = strategies.find(s => s.id === selectedStrategy);
    return strategy?.name || "Strategy";
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Risk Management</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {getSelectedStrategyName()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem
                onClick={() => handleStrategySelect(null)}
                className={!selectedStrategy ? "bg-accent" : ""}
              >
                General
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {strategies.map((strategy) => (
                <DropdownMenuItem
                  key={strategy.id}
                  onClick={() => handleStrategySelect(strategy.id)}
                  className={`${selectedStrategy === strategy.id ? "bg-accent" : ""} flex items-center justify-between group`}
                >
                  <span>{strategy.name}</span>
                  <Trash2
                    className="h-4 w-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    onClick={(e) => deleteStrategy(strategy.id, e)}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStrategySelect("new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Strategy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {showAddStrategy && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New strategy name..."
            value={newStrategyName}
            onChange={(e) => setNewStrategyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddStrategy();
              }
            }}
          />
          <Button onClick={handleAddStrategy} size="sm">
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowAddStrategy(false);
              setNewStrategyName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {isAdding && (
        <div className="space-y-3 mb-4">
          <div className="text-sm text-muted-foreground mb-2">
            Adding rule for: <span className="font-semibold text-foreground">{getSelectedStrategyName()}</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter risk management rule..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addRule();
                }
              }}
              autoFocus
            />
            <Button onClick={addRule} size="sm">
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No risk management rules for {getSelectedStrategyName()}. Add rules to protect your capital!
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