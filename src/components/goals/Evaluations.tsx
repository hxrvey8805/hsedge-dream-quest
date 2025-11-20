import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Evaluation {
  id: string;
  company: string;
  account_size: string;
  running_pl: number;
  profit_target: number;
}

export const Evaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    account_size: "",
    running_pl: 0,
    profit_target: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching evaluations", variant: "destructive" });
      return;
    }

    setEvaluations(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("evaluations")
      .insert({ ...formData, user_id: user.id });

    if (error) {
      toast({ title: "Error adding evaluation", variant: "destructive" });
      return;
    }

    toast({ title: "Evaluation added successfully" });
    setOpen(false);
    setFormData({ company: "", account_size: "", running_pl: 0, profit_target: 0 });
    fetchEvaluations();
  };

  const deleteEvaluation = async (id: string) => {
    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting evaluation", variant: "destructive" });
      return;
    }

    toast({ title: "Evaluation deleted" });
    fetchEvaluations();
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Evaluations
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Evaluation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="eval_company">Company</Label>
                  <Input
                    id="eval_company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eval_account_size">Account Size</Label>
                  <Input
                    id="eval_account_size"
                    value={formData.account_size}
                    onChange={(e) => setFormData({ ...formData, account_size: e.target.value })}
                    placeholder="e.g., 50K"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="running_pl">Running P&L ($)</Label>
                  <Input
                    id="running_pl"
                    type="number"
                    step="0.01"
                    value={formData.running_pl}
                    onChange={(e) => setFormData({ ...formData, running_pl: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="profit_target">Profit Target ($)</Label>
                  <Input
                    id="profit_target"
                    type="number"
                    step="0.01"
                    value={formData.profit_target}
                    onChange={(e) => setFormData({ ...formData, profit_target: parseFloat(e.target.value) })}
                    min="0.01"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Evaluation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {evaluations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No evaluations yet. Add your first evaluation to start tracking.</p>
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
              {evaluations.map((evaluation) => {
                const progress = (evaluation.running_pl / evaluation.profit_target) * 100;
                const progressClamped = Math.max(0, Math.min(100, progress));
                
                return (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{evaluation.company}</TableCell>
                    <TableCell>{evaluation.account_size}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            ${evaluation.running_pl.toFixed(2)} / ${evaluation.profit_target.toFixed(2)}
                          </span>
                          <span className={`font-medium ${progress >= 100 ? "text-green-500" : "text-muted-foreground"}`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={progressClamped} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEvaluation(evaluation.id)}
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
