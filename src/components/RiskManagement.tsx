import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, X, GripVertical, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStrategies } from "@/hooks/useStrategies";

interface RiskRule {
  id: string;
  rule_text: string;
  rule_order: number;
  is_active: boolean;
  strategy_id?: string | null;
}

export const RiskManagement = () => {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [newRule, setNewRule] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [newStrategyName, setNewStrategyName] = useState("");
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  
  const { strategies, deleteStrategy, addStrategy } = useStrategies();

  useEffect(() => {
    fetchRules();
  }, [selectedStrategy]);

  // Reset selection if current strategy was deleted
  useEffect(() => {
    if (selectedStrategy && !strategies.find(s => s.id === selectedStrategy)) {
      setSelectedStrategy(null);
    }
  }, [strategies, selectedStrategy]);

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

  const handleAddStrategy = async () => {
    if (!newStrategyName.trim()) return;

    const newStrategy = await addStrategy(newStrategyName.trim());
    setNewStrategyName("");
    setShowAddStrategy(false);
    
    if (newStrategy) {
      setSelectedStrategy(newStrategy.id);
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

  const handleDeleteStrategy = async (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteStrategy(strategyId);
    if (success && selectedStrategy === strategyId) {
      setSelectedStrategy(null);
    }
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
                    onClick={(e) => handleDeleteStrategy(strategy.id, e)}
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

      <div className={`space-y-2 ${rules.length > 4 ? 'max-h-[280px] overflow-y-auto pr-2' : ''}`}>
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
