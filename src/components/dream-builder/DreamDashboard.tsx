import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DreamDashboardProps {
  purchases: any[];
  incomeSources: any[];
  onUpdatePurchases: () => void;
}

export const DreamDashboard = ({
  purchases,
  incomeSources,
  onUpdatePurchases,
}: DreamDashboardProps) => {
  const calculateMonthlyCost = (
    price: number,
    downPayment: number,
    buffer: number,
    years: number
  ) => {
    if (years === 0) return 0;
    const totalCost = price * (1 + buffer / 100);
    const financed = totalCost - downPayment;
    return financed / (years * 12);
  };

  const calculateMonthlyProfit = (
    accountSize: number,
    profitSplit: number,
    monthlyReturn: number
  ) => {
    return accountSize * (monthlyReturn / 100) * (profitSplit / 100);
  };

  const totalMonthlyIncome = incomeSources.reduce((sum, source) => {
    return (
      sum +
      calculateMonthlyProfit(
        source.account_size,
        source.profit_split_percent,
        source.monthly_return_percent
      )
    );
  }, 0);

  const selectedPurchases = purchases.filter((p) => p.is_selected);
  const totalMonthlyCost = selectedPurchases.reduce((sum, purchase) => {
    return (
      sum +
      calculateMonthlyCost(
        purchase.price,
        purchase.down_payment,
        purchase.tax_interest_buffer,
        purchase.payment_period_years
      )
    );
  }, 0);

  const netMonthly = totalMonthlyIncome - totalMonthlyCost;
  const coveragePercent =
    totalMonthlyCost > 0 ? (totalMonthlyIncome / totalMonthlyCost) * 100 : 0;

  const handleTogglePurchase = async (purchaseId: string, currentSelected: boolean) => {
    try {
      const { error } = await supabase
        .from("dream_purchases")
        .update({ is_selected: !currentSelected })
        .eq("id", purchaseId);

      if (error) throw error;
      onUpdatePurchases();
    } catch (error: any) {
      toast.error("Failed to update selection");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Dream Dashboard</h2>
            <p className="text-muted-foreground">
              Select items to include in your lifestyle calculation
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-success/10 border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-success">Monthly Income</h3>
            </div>
            <p className="text-3xl font-bold text-success">
              £{totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </Card>

          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Monthly Costs</h3>
            </div>
            <p className="text-3xl font-bold text-destructive">
              £{totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </Card>

          <Card
            className={`p-6 ${
              netMonthly >= 0
                ? "bg-success/10 border-success/20"
                : "bg-destructive/10 border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {netMonthly >= 0 ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <h3
                className={`font-semibold ${
                  netMonthly >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                Net Monthly
              </h3>
            </div>
            <p
              className={`text-3xl font-bold ${
                netMonthly >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {netMonthly >= 0 ? "+" : ""}
              £{netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Dream Coverage</h3>
            <span className="text-2xl font-bold text-primary">
              {Math.min(coveragePercent, 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={Math.min(coveragePercent, 100)} className="h-3 mb-2" />
          {netMonthly >= 0 ? (
            <p className="text-success font-medium">
              ✨ You can currently afford {Math.min(coveragePercent, 100).toFixed(0)}% of your selected
              dream lifestyle!
            </p>
          ) : (
            <p className="text-destructive font-medium">
              You're £{Math.abs(netMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })} short of
              covering all selected goals
            </p>
          )}
        </Card>

        {/* Vision Board Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Your Dream Vision Board</h3>
          
          {/* Selected Items Vision Board */}
          {selectedPurchases.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4 text-primary">Selected Dreams</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedPurchases.map((purchase) => {
                  const monthly = calculateMonthlyCost(
                    purchase.price,
                    purchase.down_payment,
                    purchase.tax_interest_buffer,
                    purchase.payment_period_years
                  );

                  return (
                    <Card
                      key={purchase.id}
                      className="group relative overflow-hidden border-2 border-primary/50 bg-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="relative aspect-square">
                        {purchase.image_url ? (
                          <img
                            src={purchase.image_url}
                            alt={purchase.item_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <div className="text-center p-4">
                              <div className="text-4xl mb-2">✨</div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {purchase.item_name}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="font-bold text-lg mb-1 text-foreground">
                              {purchase.item_name}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              £{purchase.price.toLocaleString()}
                            </p>
                            {monthly > 0 && (
                              <p className="text-xs font-semibold text-primary">
                                £{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Items Selection Grid */}
          <div>
            <h4 className="text-lg font-medium mb-4">All Dream Items</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {purchases.map((purchase) => {
            const monthly = calculateMonthlyCost(
              purchase.price,
              purchase.down_payment,
              purchase.tax_interest_buffer,
              purchase.payment_period_years
            );

            return (
              <Card
                key={purchase.id}
                    className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                  purchase.is_selected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                }`}
                    onClick={() =>
                        handleTogglePurchase(purchase.id, purchase.is_selected)
                      }
                  >
                    <div className="relative aspect-square">
                      {purchase.image_url ? (
                        <img
                          src={purchase.image_url}
                          alt={purchase.item_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10">
                          <div className="text-center p-4">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {purchase.item_name}
                      </p>
                    </div>
                  </div>
                      )}
                      
                      {/* Checkbox overlay */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            purchase.is_selected
                              ? "bg-primary border-primary"
                              : "bg-background/80 border-border backdrop-blur-sm"
                          }`}
                        >
                          {purchase.is_selected && (
                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-lg mb-1 text-foreground">
                            {purchase.item_name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            £{purchase.price.toLocaleString()}
                          </p>
                          {monthly > 0 && (
                            <p className="text-xs font-semibold text-primary">
                              £{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                            </p>
                          )}
                        </div>
                  </div>
                </div>
              </Card>
            );
          })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
