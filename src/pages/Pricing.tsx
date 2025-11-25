import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import logo from "@/assets/hs-logo.png";

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Our Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-4">Sign up now.</p>
          <p className="text-2xl font-bold mb-6">Get used to winning</p>
          <p className="text-lg text-muted-foreground mb-8">
            Our subscription options give you access to everything that HS-Edge has to offer.
          </p>
          
          {/* Yearly Discount Banner */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/10">
              <span className="text-sm font-semibold text-primary">Get 36% Off When You Pay Yearly</span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </Label>
            <Switch
              id="billing-toggle"
              checked={!isYearly}
              onCheckedChange={(checked) => setIsYearly(!checked)}
            />
            <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Yearly Plan */}
          <div className={`p-8 rounded-2xl border-2 ${isYearly ? 'border-primary/50 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm shadow-lg shadow-primary/10' : 'border-border/50 bg-card/50'} relative hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
            {isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-lg">
                Best Value
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Yearly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">$12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock the full power of HS-Edge with a discount.
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">All features +</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Trading Calendar</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Statistics & Analytics</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Dream Builder</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Achievements & Levels</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Goals Tracking</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Risk Management</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Strategy Checklist</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Equity Curve</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Log Your Trade</span>
              </div>
            </div>
            
            <Button className={`w-full ${isYearly ? 'bg-primary hover:bg-primary/90' : ''}`} size="lg" variant={isYearly ? "default" : "outline"} onClick={() => navigate("/auth")}>
              Choose the plan
            </Button>
          </div>

          {/* Monthly Plan */}
          <div className={`p-8 rounded-2xl border-2 ${!isYearly ? 'border-primary/50 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm shadow-lg shadow-primary/10' : 'border-border/50 bg-card/50'} relative hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
            {!isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-lg">
                Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Best for users looking to try out the platform.
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">All features +</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Trading Calendar</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Statistics & Analytics</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Dream Builder</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Achievements & Levels</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Goals Tracking</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Risk Management</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Strategy Checklist</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Equity Curve</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span className="text-sm">Log Your Trade</span>
              </div>
            </div>
            
            <Button className={`w-full ${!isYearly ? 'bg-primary hover:bg-primary/90' : ''}`} size="lg" variant={!isYearly ? "default" : "outline"} onClick={() => navigate("/auth")}>
              Choose the plan
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 HS-Edge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
