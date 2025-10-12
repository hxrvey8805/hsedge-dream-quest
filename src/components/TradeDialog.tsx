import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface TradeDialogProps {
  selectedDate?: Date;
  onTradeAdded?: () => void;
}

export const TradeDialog = ({ selectedDate, onTradeAdded }: TradeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tradeData = {
      trade_date: formData.get("trade_date") as string,
      pair: formData.get("pair") as string,
      buy_sell: formData.get("buy_sell") as string,
      outcome: formData.get("outcome") as string,
      pips: parseFloat(formData.get("pips") as string) || 0,
      time_opened: formData.get("time_opened") as string || null,
      time_closed: formData.get("time_closed") as string || null,
      session: formData.get("session") as string || null,
      strategy_type: formData.get("strategy_type") as string || null,
      entry_type: formData.get("entry_type") as string || null,
      notes: formData.get("notes") as string || null,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    };

    const { error } = await supabase.from("trades").insert([tradeData]);

    if (error) {
      toast.error("Failed to log trade");
      console.error(error);
    } else {
      toast.success("Trade logged successfully!");
      setOpen(false);
      onTradeAdded?.();
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  const defaultDate = selectedDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Log Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade_date">Date *</Label>
              <Input
                id="trade_date"
                name="trade_date"
                type="date"
                defaultValue={defaultDate}
                required
              />
            </div>
            <div>
              <Label htmlFor="pair">Pair *</Label>
              <Input
                id="pair"
                name="pair"
                placeholder="EUR/USD"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buy_sell">Direction *</Label>
              <Select name="buy_sell" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
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
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="Breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_opened">Time Opened</Label>
              <Input
                id="time_opened"
                name="time_opened"
                type="time"
              />
            </div>
            <div>
              <Label htmlFor="time_closed">Time Closed</Label>
              <Input
                id="time_closed"
                name="time_closed"
                type="time"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="session">Session</Label>
              <Select name="session">
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strategy_type">Strategy</Label>
              <Input
                id="strategy_type"
                name="strategy_type"
                placeholder="SMC, ICT, etc."
              />
            </div>
            <div>
              <Label htmlFor="entry_type">Entry Type</Label>
              <Input
                id="entry_type"
                name="entry_type"
                placeholder="Market, Limit"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pips">Pips *</Label>
            <Input
              id="pips"
              name="pips"
              type="number"
              step="0.1"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="What went well? What could be improved?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
