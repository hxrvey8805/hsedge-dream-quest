import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";
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
  type: string;
}

export const StrategyChecklist = () => {
  const [items, setItems] = useState<StrategyItem[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("default");
  const [newItem, setNewItem] = useState("");
  const [newStrategyName, setNewStrategyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStrategies();
    fetchItems();
  }, [selectedStrategyId]);

  const fetchStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trading_strategies")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "strategy_checklist")
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

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("strategy_checklist")
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
      toast.error("Failed to load strategy checklist");
      return;
    }

    if (data) {
      setItems(data);
    }
  };

  const createStrategy = async () => {
    if (!newStrategyName.trim()) {
      toast.error("Please enter a strategy name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trading_strategies")
      .insert({
        user_id: user.id,
        name: newStrategyName.trim(),
        type: "strategy_checklist",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create strategy");
      return;
    }

    toast.success("Strategy created");
    setNewStrategyName("");
    fetchStrategies();
    if (data) {
      setSelectedStrategyId(data.id);
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

  const addItem = async () => {
    if (!newItem.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.rule_order)) : 0;

    const itemData: any = {
      user_id: user.id,
      rule_text: newItem.trim(),
      rule_order: maxOrder + 1,
      is_active: true,
    };

    if (selectedStrategyId && selectedStrategyId !== "default") {
      itemData.strategy_id = selectedStrategyId;
    }

    const { error } = await supabase
      .from("strategy_checklist")
      .insert(itemData);

    if (error) {
      toast.error("Failed to add item");
      return;
    }

    toast.success("Item added");
    setNewItem("");
    setIsAdding(false);
    fetchItems();
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
    fetchItems();
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Strategy Checklist</h2>
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
                if (confirm("Delete this strategy? All items will be moved to Default.")) {
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
            Add Item
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-4">
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
