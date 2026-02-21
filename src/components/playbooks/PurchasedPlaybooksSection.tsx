import { Card } from "@/components/ui/card";
import { ShoppingBag, Lock } from "lucide-react";

export function PurchasedPlaybooksSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Purchased Playbooks</h2>
      </div>

      <Card className="bg-card border-border border-dashed">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-primary/60" />
          </div>
          <h3 className="text-foreground font-semibold mb-2">No purchased playbooks yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            When you purchase playbooks from TradePeaks, they'll appear here with full strategy details, entry/exit rules, and annotated charts.
          </p>
        </div>
      </Card>
    </div>
  );
}
