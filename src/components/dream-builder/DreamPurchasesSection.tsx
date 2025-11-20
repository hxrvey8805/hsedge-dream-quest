import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface DreamPurchasesSectionProps {
  dreamProfileId: string | null;
  purchases: any[];
  onUpdate: () => void;
}

interface PresetItem {
  name: string;
  price: number;
  downPayment: number;
  buffer: number;
  years: number;
  category: string;
  image: string;
}

const presetItems: PresetItem[] = [
  {
    name: "Lamborghini Aventador",
    price: 350000,
    downPayment: 70000,
    buffer: 5,
    years: 5,
    category: "Vehicle",
    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=300&fit=crop",
  },
  {
    name: "Rolex Submariner",
    price: 10000,
    downPayment: 10000,
    buffer: 0,
    years: 0,
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop",
  },
  {
    name: "Dubai Penthouse",
    price: 2000000,
    downPayment: 500000,
    buffer: 8,
    years: 25,
    category: "Property",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
  },
  {
    name: "Luxury Yacht",
    price: 1500000,
    downPayment: 375000,
    buffer: 7,
    years: 15,
    category: "Vehicle",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=300&fit=crop",
  },
  {
    name: "Private Jet Share",
    price: 500000,
    downPayment: 150000,
    buffer: 6,
    years: 10,
    category: "Experience",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=300&fit=crop",
  },
  {
    name: "Luxury Watch Collection",
    price: 50000,
    downPayment: 25000,
    buffer: 3,
    years: 2,
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=300&fit=crop",
  },
];

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

  const handleAddPresetItem = async (item: PresetItem) => {
    if (!dreamProfileId) {
      toast.error("Please save your dream vision first");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("dream_purchases").insert([
        {
          dream_profile_id: dreamProfileId,
          user_id: user.id,
          item_name: item.name,
          price: item.price,
          down_payment: item.downPayment,
          tax_interest_buffer: item.buffer,
          payment_period_years: item.years,
        },
      ]);

      if (error) throw error;

      toast.success(`${item.name} added to your dream purchases!`);
      onUpdate();
      
      // Scroll to table
      setTimeout(() => {
        document.querySelector('[data-dream-purchases-table]')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    } catch (error: any) {
      toast.error("Failed to add purchase");
      console.error(error);
    }
  };

  const calculatePresetMonthlyCost = (item: PresetItem) => {
    if (item.years === 0) return 0;
    const totalCost = item.price * (1 + item.buffer / 100);
    const financed = totalCost - item.downPayment;
    return financed / (item.years * 12);
  };

  return (
    <div className="space-y-6">
      {/* Preset Luxury Items Gallery */}
      <Card className="p-8 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm border-primary/10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-7 w-7 text-primary" />
          <div>
            <h3 className="text-2xl font-bold">Quick Add Luxury Items</h3>
            <p className="text-sm text-muted-foreground">
              Click any item to instantly add it to your dream purchases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetItems.map((item) => (
            <HoverCard key={item.name}>
              <HoverCardTrigger asChild>
                <div
                  onClick={() => handleAddPresetItem(item)}
                  className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-border/50 hover:border-primary/50"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium">
                      {item.category}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {item.name}
                      </h4>
                      <p className="text-2xl font-bold text-primary">
                        £{item.price.toLocaleString()}
                      </p>
                      
                      {/* Add Button - Shows on Hover */}
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm">
                          <Plus className="h-4 w-4" />
                          Add to Purchases
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="top">
                <div className="space-y-2">
                  <h4 className="font-semibold">{item.name}</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Price: <span className="font-medium text-foreground">£{item.price.toLocaleString()}</span></p>
                    <p>Down Payment: <span className="font-medium text-foreground">£{item.downPayment.toLocaleString()}</span></p>
                    <p>Payment Period: <span className="font-medium text-foreground">{item.years} years</span></p>
                    {item.years > 0 && (
                      <p className="text-primary font-medium">
                        Monthly: £{calculatePresetMonthlyCost(item).toLocaleString('en-GB', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm" data-dream-purchases-table>
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
