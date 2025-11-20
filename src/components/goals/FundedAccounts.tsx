import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface FundedAccount {
  id: string;
  company: string;
  account_size: string;
  funded_accounts_count: number;
  funded_accounts_goal: number;
}

export const FundedAccounts = () => {
  const [accounts, setAccounts] = useState<FundedAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    account_size: "",
    funded_accounts_count: 0,
    funded_accounts_goal: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("funded_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching accounts", variant: "destructive" });
      return;
    }

    setAccounts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("funded_accounts")
      .insert({ ...formData, user_id: user.id });

    if (error) {
      toast({ title: "Error adding account", variant: "destructive" });
      return;
    }

    toast({ title: "Account added successfully" });
    setOpen(false);
    setFormData({ company: "", account_size: "", funded_accounts_count: 0, funded_accounts_goal: 1 });
    fetchAccounts();
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from("funded_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting account", variant: "destructive" });
      return;
    }

    toast({ title: "Account deleted" });
    fetchAccounts();
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            Funded Accounts
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funded Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account_size">Account Size</Label>
                  <Input
                    id="account_size"
                    value={formData.account_size}
                    onChange={(e) => setFormData({ ...formData, account_size: e.target.value })}
                    placeholder="e.g., 100K"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="funded_count">Current Funded Accounts</Label>
                  <Input
                    id="funded_count"
                    type="number"
                    value={formData.funded_accounts_count}
                    onChange={(e) => setFormData({ ...formData, funded_accounts_count: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="funded_goal">Funded Accounts Goal</Label>
                  <Input
                    id="funded_goal"
                    type="number"
                    value={formData.funded_accounts_goal}
                    onChange={(e) => setFormData({ ...formData, funded_accounts_goal: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Account</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No funded accounts yet. Add your first account to start tracking.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Account Size</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => {
                const progress = (account.funded_accounts_count / account.funded_accounts_goal) * 100;
                return (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.company}</TableCell>
                    <TableCell>{account.account_size}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{account.funded_accounts_count} / {account.funded_accounts_goal}</span>
                          <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
