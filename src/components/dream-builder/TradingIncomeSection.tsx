import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, TrendingUp, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TradingIncomeSectionProps {
  dreamProfileId: string | null;
  incomeSources: any[];
  onUpdate: () => void;
}

export const TradingIncomeSection = ({
  dreamProfileId,
  incomeSources,
  onUpdate,
}: TradingIncomeSectionProps) => {
  const [newSource, setNewSource] = useState({
    source_name: "",
    account_size: "",
    profit_split_percent: "",
    monthly_return_percent: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSourceName, setEditSourceName] = useState("");

  const calculateMonthlyProfit = (
    accountSize: number,
    profitSplit: number,
    monthlyReturn: number
  ) => {
    return (accountSize * (monthlyReturn / 100) * (profitSplit / 100));
  };

  const handleAddSource = async () => {
    if (!dreamProfileId) {
      toast.error("Please save your dream vision first");
      return;
    }

    if (
      !newSource.source_name ||
      !newSource.account_size ||
      !newSource.profit_split_percent ||
      !newSource.monthly_return_percent
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("trading_income_sources").insert([
        {
          dream_profile_id: dreamProfileId,
          user_id: user.id,
          source_name: newSource.source_name,
          account_size: parseFloat(newSource.account_size),
          profit_split_percent: parseFloat(newSource.profit_split_percent),
          monthly_return_percent: parseFloat(newSource.monthly_return_percent),
        },
      ]);

      if (error) throw error;

      toast.success("Income source added!");
      setNewSource({
        source_name: "",
        account_size: "",
        profit_split_percent: "",
        monthly_return_percent: "",
      });
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to add income source");
      console.error(error);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trading_income_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Income source removed");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to remove income source");
      console.error(error);
    }
  };

  const handleEditSource = (source: any) => {
    setEditingId(source.id);
    setEditSourceName(source.source_name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditSourceName("");
  };

  const handleSaveEdit = async (sourceId: string) => {
    if (!editSourceName.trim()) {
      toast.error("Source name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("trading_income_sources")
        .update({ source_name: editSourceName.trim() })
        .eq("id", sourceId);

      if (error) throw error;

      toast.success("Source name updated!");
      setEditingId(null);
      setEditSourceName("");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update source name");
      console.error(error);
    }
  };

  const totalMonthlyIncome = incomeSources.reduce((sum, source) => {
    return sum + calculateMonthlyProfit(
      source.account_size,
      source.profit_split_percent,
      source.monthly_return_percent
    );
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-8 w-8 text-success" />
          <div>
            <h2 className="text-3xl font-bold">Expected Trading Returns</h2>
            <p className="text-muted-foreground">
              Plan your expected monthly income from trading
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Name</TableHead>
                <TableHead>Account Size (£)</TableHead>
                <TableHead>Profit Split (%)</TableHead>
                <TableHead>Monthly Return (%)</TableHead>
                <TableHead>Monthly Net Profit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeSources.map((source) => {
                const monthlyProfit = calculateMonthlyProfit(
                  source.account_size,
                  source.profit_split_percent,
                  source.monthly_return_percent
                );
                const isEditing = editingId === source.id;

                return (
                  <TableRow key={source.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editSourceName}
                          onChange={(e) => setEditSourceName(e.target.value)}
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(source.id);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                      ) : (
                        <span className="font-medium">{source.source_name}</span>
                      )}
                    </TableCell>
                    <TableCell>£{source.account_size.toLocaleString()}</TableCell>
                    <TableCell>{source.profit_split_percent}%</TableCell>
                    <TableCell>{source.monthly_return_percent}%</TableCell>
                    <TableCell className="font-semibold text-success">
                      £{monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveEdit(source.id)}
                            >
                              <Save className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSource(source)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSource(source.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow className="bg-muted/20">
                <TableCell>
                  <Input
                    placeholder="e.g., FTMO"
                    value={newSource.source_name}
                    onChange={(e) =>
                      setNewSource({ ...newSource, source_name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={newSource.account_size}
                    onChange={(e) =>
                      setNewSource({ ...newSource, account_size: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="70"
                    value={newSource.profit_split_percent}
                    onChange={(e) =>
                      setNewSource({ ...newSource, profit_split_percent: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="8"
                    step="0.1"
                    value={newSource.monthly_return_percent}
                    onChange={(e) =>
                      setNewSource({
                        ...newSource,
                        monthly_return_percent: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell colSpan={2}>
                  <Button onClick={handleAddSource} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </TableCell>
              </TableRow>

              {incomeSources.length > 0 && (
                <TableRow className="bg-primary/10 font-bold">
                  <TableCell colSpan={4} className="text-right">
                    Total Monthly Income:
                  </TableCell>
                  <TableCell className="text-success text-lg">
                    £{totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
