import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, X, GripVertical, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface StrategyItem {
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

export const StrategyChecklist = () => {
  const [items, setItems] = useState<StrategyItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [newStrategyName, setNewStrategyName] = useState("");
  const [showAddStrategy, setShowAddStrategy] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchStrategies();
  }, []);

  const fetchItems = async (strategyId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query: any = supabase
      .from("strategy_checklist")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (strategyId) {
      query = query.eq("strategy_id", strategyId);
    }

    const { data, error } = await query.order("rule_order", { ascending: true });

    if (error) {
      toast.error("Failed to load strategy checklist");
      return;
    }

    if (data) {
      setItems(data);
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
      fetchItems(newStrategyId);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.rule_order)) : 0;

    const { error } = await supabase
      .from("strategy_checklist")
      .insert({
        user_id: user.id,
        rule_text: newItem.trim(),
        rule_order: maxOrder + 1,
        is_active: true,
        strategy_id: selectedStrategy || null,
      });

    if (error) {
      toast.error("Failed to add item");
      return;
    }

    toast.success("Item added");
    setNewItem("");
    setIsAdding(false);
    fetchItems(selectedStrategy || undefined);
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("strategy_checklist")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove item");
      return;
    }

    toast.success("Item removed");
    fetchItems(selectedStrategy || undefined);
  };

  const handleStrategySelect = (strategyId: string) => {
    if (strategyId === "new") {
      setShowAddStrategy(true);
      return;
    }
    setSelectedStrategy(strategyId);
    setIsAdding(true);
    fetchItems(strategyId);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Strategy Checklist</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Strategy
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {strategies.map((strategy) => (
                <DropdownMenuItem
                  key={strategy.id}
                  onClick={() => handleStrategySelect(strategy.id)}
                >
                  {strategy.name}
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
            onClick={() => {
              setSelectedStrategy("");
              setIsAdding(!isAdding);
              fetchItems();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
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
          {selectedStrategy && (
            <div className="text-sm text-muted-foreground mb-2">
              Adding item for: <span className="font-semibold">{strategies.find(s => s.id === selectedStrategy)?.name || "Unknown"}</span>
            </div>
          )}
          <Select value={selectedStrategy || "none"} onValueChange={(value) => {
            const newValue = value === "none" ? "" : value;
            setSelectedStrategy(newValue);
            fetchItems(newValue || undefined);
          }}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="Select strategy (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Strategy</SelectItem>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              placeholder="Enter checklist item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addItem();
                }
              }}
            />
            <Button onClick={addItem} size="sm">
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No checklist items yet. Add items to follow your strategy!
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-primary mr-2">{index + 1}.</span>
              <span className="flex-1">{item.rule_text}</span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItem(item.id)}
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