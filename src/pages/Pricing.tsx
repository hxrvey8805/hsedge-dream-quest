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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS Journal" className="h-10 w-10" />
            <span className="text-xl font-bold">HS Journal</span>
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
          <h1 className="text-5xl font-bold mb-4">Our Pricing</h1>
          <p className="text-xl text-muted-foreground mb-8">Sign up now.</p>
          <p className="text-2xl font-bold mb-8">Get used to winning</p>
          <p className="text-lg text-muted-foreground mb-8">
            Our subscription options give you access to everything that HS-Edge has to offer.
          </p>
          
          {/* Yearly Discount Banner */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-semibold text-primary">Get 36% Off When You Pay Yearly</span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </Label>
            <Switch
              id="billing-toggle"
              checked={!isYearly}
              onCheckedChange={(checked) => setIsYearly(!checked)}
            />
            <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Yearly Plan */}
          <div className={`p-8 rounded-2xl border-2 ${isYearly ? 'border-primary bg-card' : 'border-border bg-card/50'} relative hover:shadow-lg transition-all`}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Yearly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock the full power of HS-Edge with a discount.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>All features +</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Trading Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Statistics & Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Dream Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Achievements & Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Goals Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Risk Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Strategy Checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Equity Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Log Your Trade</span>
              </div>
            </div>
            
            <Button className={`w-full ${isYearly ? 'bg-primary hover:bg-primary/90' : ''}`} size="lg" variant={isYearly ? "default" : "outline"} onClick={() => navigate("/auth")}>
              Choose the plan
            </Button>
          </div>

          {/* Monthly Plan */}
          <div className={`p-8 rounded-2xl border-2 ${!isYearly ? 'border-primary bg-card' : 'border-border bg-card/50'} relative hover:shadow-lg transition-all`}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Best for users looking to try out the platform.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>All features +</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Trading Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Statistics & Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Dream Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Achievements & Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Goals Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Risk Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Strategy Checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Equity Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Log Your Trade</span>
              </div>
            </div>
            
            <Button className={`w-full ${!isYearly ? 'bg-primary hover:bg-primary/90' : ''}`} size="lg" variant={!isYearly ? "default" : "outline"} onClick={() => navigate("/auth")}>
              Choose the plan
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 HS Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
