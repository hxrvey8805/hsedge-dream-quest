import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TradeDialogProps {
  selectedDate?: Date | null;
  onTradeAdded?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TradeDialog = ({ selectedDate, onTradeAdded, open, onOpenChange }: TradeDialogProps) => {
  const [loading, setLoading] = useState(false);

  const defaultDate = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tradeDate = formData.get("trade_date") as string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        trade_date: tradeDate,
        day_of_week: new Date(tradeDate).toLocaleDateString('en-US', { weekday: 'long' }),
        pair: formData.get("pair") as string,
        time_opened: formData.get("time_opened") as string || null,
        time_closed: formData.get("time_closed") as string || null,
        duration: formData.get("duration") as string || null,
        buy_sell: formData.get("buy_sell") as string,
        session: formData.get("session") as string || null,
        strategy_type: formData.get("strategy_type") as string || null,
        entry_type: formData.get("entry_type") as string || null,
        entry_timeframe: formData.get("entry_timeframe") as string || null,
        risk_to_pay: formData.get("risk_to_pay") ? parseFloat(formData.get("risk_to_pay") as string) : null,
        total_pips_secured: formData.get("total_pips_secured") ? parseFloat(formData.get("total_pips_secured") as string) : null,
        max_drawdown_pips: formData.get("max_drawdown_pips") ? parseFloat(formData.get("max_drawdown_pips") as string) : null,
        pips: formData.get("pips") ? parseFloat(formData.get("pips") as string) : null,
        profit: formData.get("profit") ? parseFloat(formData.get("profit") as string) : null,
        original_take_profit_percent: formData.get("original_take_profit_percent") ? parseFloat(formData.get("original_take_profit_percent") as string) : null,
        outcome: formData.get("outcome") as string,
        notes: formData.get("notes") as string || null,
      });

      if (error) throw error;

      toast.success("Trade logged successfully!");
      onOpenChange(false);
      onTradeAdded?.();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade_date">Date *</Label>
              <Input id="trade_date" name="trade_date" type="date" defaultValue={defaultDate} required />
            </div>
            <div>
              <Label htmlFor="pair">Pair *</Label>
              <Input id="pair" name="pair" placeholder="e.g., EUR/USD" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_opened">Time Opened</Label>
              <Input id="time_opened" name="time_opened" type="time" />
            </div>
            <div>
              <Label htmlFor="time_closed">Time Closed</Label>
              <Input id="time_closed" name="time_closed" type="time" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buy_sell">Buy/Sell *</Label>
              <Select name="buy_sell" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="outcome">Outcome *</Label>
              <Select name="outcome" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="Break Even">Break Even</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="session">Session</Label>
              <Select name="session">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strategy_type">Strategy</Label>
              <Input id="strategy_type" name="strategy_type" placeholder="e.g., Breakout" />
            </div>
            <div>
              <Label htmlFor="entry_type">Entry Type</Label>
              <Input id="entry_type" name="entry_type" placeholder="e.g., Limit" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pips">Pips</Label>
              <Input id="pips" name="pips" type="number" step="0.1" placeholder="0.0" />
            </div>
            <div>
              <Label htmlFor="profit">Profit ($)</Label>
              <Input id="profit" name="profit" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="risk_to_pay">Risk to Pay</Label>
              <Input id="risk_to_pay" name="risk_to_pay" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="total_pips_secured">Total Pips Secured</Label>
              <Input id="total_pips_secured" name="total_pips_secured" type="number" step="0.1" placeholder="0.0" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Trade notes..." rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
