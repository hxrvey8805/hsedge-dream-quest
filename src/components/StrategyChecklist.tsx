import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface StrategyItem {
  id: string;
  rule_text: string;
  rule_order: number;
  is_active: boolean;
}

export const StrategyChecklist = () => {
  const [items, setItems] = useState<StrategyItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("strategy_checklist")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("rule_order", { ascending: true });

    if (error) {
      toast.error("Failed to load strategy checklist");
      return;
    }

    if (data) {
      setItems(data);
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
      });

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
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
