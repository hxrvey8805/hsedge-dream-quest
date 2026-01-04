import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddAccountDialogProps {
  type: 'personal' | 'funded' | 'evaluation' | 'backtesting';
  userId: string;
  onSuccess: () => void;
}

export const AddAccountDialog = ({ type, userId, onSuccess }: AddAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Personal account fields
  const [accountName, setAccountName] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [broker, setBroker] = useState("");

  // Funded/Evaluation fields
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [maxLoss, setMaxLoss] = useState("");
  const [profitTarget, setProfitTarget] = useState("");

  // Backtesting fields
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [startingBalance, setStartingBalance] = useState("");
  const [fundedGoal, setFundedGoal] = useState("1");

  const resetForm = () => {
    setAccountName("");
    setAccountSize("");
    setBroker("");
    setCompany("");
    setSize("");
    setMaxLoss("");
    setProfitTarget("");
    setFundedGoal("1");
    setSessionName("");
    setDescription("");
    setStartingBalance("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'personal') {
        const { error } = await supabase.from("personal_accounts").insert({
          user_id: userId,
          account_name: accountName,
          account_size: parseFloat(accountSize) || 0,
          broker: broker || null,
        });
        if (error) throw error;
      } else if (type === 'funded') {
        const { error } = await supabase.from("funded_accounts").insert({
          user_id: userId,
          company,
          account_size: size,
          funded_accounts_goal: parseInt(fundedGoal) || 1,
          max_loss: parseFloat(maxLoss) || 0,
        });
        if (error) throw error;
      } else if (type === 'evaluation') {
        const { error } = await supabase.from("evaluations").insert({
          user_id: userId,
          company,
          account_size: size,
          profit_target: parseFloat(profitTarget) || 0,
          max_loss: parseFloat(maxLoss) || 0,
        });
        if (error) throw error;
      } else if (type === 'backtesting') {
        const { error } = await supabase.from("backtesting_sessions").insert({
          user_id: userId,
          session_name: sessionName,
          description: description || null,
          starting_balance: parseFloat(startingBalance) || 10000,
        });
        if (error) throw error;
      }

      toast.success("Account added successfully!");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'personal': return 'Add Personal Account';
      case 'funded': return 'Add Funded Account';
      case 'evaluation': return 'Add Evaluation Account';
      case 'backtesting': return 'Add Backtesting Session';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {type === 'personal' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Trading Account"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountSize">Account Size ($)</Label>
                <Input
                  id="accountSize"
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(e.target.value)}
                  placeholder="10000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broker">Broker (Optional)</Label>
                <Input
                  id="broker"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  placeholder="Interactive Brokers"
                />
              </div>
            </>
          )}
          {type === 'backtesting' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sessionName">Session Name</Label>
                <Input
                  id="sessionName"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="ICT Strategy Backtest"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingBalance">Starting Balance ($)</Label>
                <Input
                  id="startingBalance"
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  placeholder="10000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Testing my new strategy on historical data"
                />
              </div>
            </>
          )}
          {(type === 'funded' || type === 'evaluation') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Prop Firm / Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="FTMO, MyForexFunds, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Account Size</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="$100,000"
                  required
                />
              </div>
              {type === 'funded' && (
                <div className="space-y-2">
                  <Label htmlFor="fundedGoal">Funded Accounts Goal</Label>
                  <Input
                    id="fundedGoal"
                    type="number"
                    value={fundedGoal}
                    onChange={(e) => setFundedGoal(e.target.value)}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
              )}
              {type === 'evaluation' && (
                <div className="space-y-2">
                  <Label htmlFor="profitTarget">Profit Target ($)</Label>
                  <Input
                    id="profitTarget"
                    type="number"
                    value={profitTarget}
                    onChange={(e) => setProfitTarget(e.target.value)}
                    placeholder="10000"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="maxLoss">Max Loss ($)</Label>
                <Input
                  id="maxLoss"
                  type="number"
                  value={maxLoss}
                  onChange={(e) => setMaxLoss(e.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
