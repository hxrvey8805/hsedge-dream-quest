import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DreamPurchasesSectionProps {
  dreamProfileId: string | null;
  purchases: any[];
  onUpdate: () => void;
}

export const DreamPurchasesSection = ({
  dreamProfileId,
  purchases,
  onUpdate,
}: DreamPurchasesSectionProps) => {
  const [newPurchase, setNewPurchase] = useState({
    item_name: "",
    price: "",
    down_payment: "",
    tax_interest_buffer: "",
    payment_period_years: "",
  });

  const calculateTotalCost = (price: number, buffer: number) => {
    return price * (1 + buffer / 100);
  };

  const calculateMonthlyCost = (
    price: number,
    downPayment: number,
    buffer: number,
    years: number
  ) => {
    if (years === 0) return 0;
    const totalCost = calculateTotalCost(price, buffer);
    const financed = totalCost - downPayment;
    return financed / (years * 12);
  };

  const handleAddPurchase = async () => {
    if (!dreamProfileId) {
      toast.error("Please save your dream vision first");
      return;
    }

    if (!newPurchase.item_name || !newPurchase.price) {
      toast.error("Please fill in item name and price");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("dream_purchases").insert([
        {
          dream_profile_id: dreamProfileId,
          user_id: user.id,
          item_name: newPurchase.item_name,
          price: parseFloat(newPurchase.price),
          down_payment: parseFloat(newPurchase.down_payment) || 0,
          tax_interest_buffer: parseFloat(newPurchase.tax_interest_buffer) || 0,
          payment_period_years: parseFloat(newPurchase.payment_period_years) || 0,
        },
      ]);

      if (error) throw error;

      toast.success("Purchase added!");
      setNewPurchase({
        item_name: "",
        price: "",
        down_payment: "",
        tax_interest_buffer: "",
        payment_period_years: "",
      });
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to add purchase");
      console.error(error);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    try {
      const { error } = await supabase.from("dream_purchases").delete().eq("id", id);

      if (error) throw error;
      toast.success("Purchase removed");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to remove purchase");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Dream Purchases</h2>
            <p className="text-muted-foreground">
              Visualize and calculate specific dream purchases
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Price (£)</TableHead>
                <TableHead>Down Payment</TableHead>
                <TableHead>Buffer (%)</TableHead>
                <TableHead>Years</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const totalCost = calculateTotalCost(
                  purchase.price,
                  purchase.tax_interest_buffer
                );
                const monthly = calculateMonthlyCost(
                  purchase.price,
                  purchase.down_payment,
                  purchase.tax_interest_buffer,
                  purchase.payment_period_years
                );

                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.item_name}</TableCell>
                    <TableCell>£{purchase.price.toLocaleString()}</TableCell>
                    <TableCell>£{purchase.down_payment.toLocaleString()}</TableCell>
                    <TableCell>{purchase.tax_interest_buffer}%</TableCell>
                    <TableCell>{purchase.payment_period_years}</TableCell>
                    <TableCell>£{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="font-semibold">
                      £{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePurchase(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow className="bg-muted/20">
                <TableCell>
                  <Input
                    placeholder="Item name"
                    value={newPurchase.item_name}
                    onChange={(e) =>
                      setNewPurchase({ ...newPurchase, item_name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newPurchase.price}
                    onChange={(e) =>
                      setNewPurchase({ ...newPurchase, price: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPurchase.down_payment}
                    onChange={(e) =>
                      setNewPurchase({ ...newPurchase, down_payment: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPurchase.tax_interest_buffer}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        tax_interest_buffer: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPurchase.payment_period_years}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        payment_period_years: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell colSpan={2}>
                  <Button onClick={handleAddPurchase} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
