import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

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
  const [strategies, setStrategies] = useState<{id: string, name: string}[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [newStrategyName, setNewStrategyName] = useState("");
  const [showAddStrategy, setShowAddStrategy] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchStrategies();
  }, []);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("risk_management_rules")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("rule_order", { ascending: true });

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

    const { data, error } = await supabase
      .from("strategies")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!error && data) {
      setStrategies(data);
    }
  };

  const handleAddStrategy = async () => {
    if (!newStrategyName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("strategies")
      .insert({
        user_id: user.id,
        name: newStrategyName.trim(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add strategy");
      return;
    }

    toast.success("Strategy added!");
    setNewStrategyName("");
    setShowAddStrategy(false);
    await fetchStrategies();
    if (data) {
      setSelectedStrategy(data.id);
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
    setIsAdding(false);
    setSelectedStrategy("");
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddStrategy(!showAddStrategy)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Strategy
          </Button>
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
        </div>
      )}

      {isAdding && (
        <div className="space-y-3 mb-4">
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="Select strategy (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Strategy</SelectItem>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
