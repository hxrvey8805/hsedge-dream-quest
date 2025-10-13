import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/hs-logo.png";

const Pricing = () => {
  const navigate = useNavigate();

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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">Start your journey to trading excellence</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Up to 50 trades per month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Basic statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Dream Builder (1 dream)</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => navigate("/auth")}>Get Started</Button>
          </div>

          <div className="p-8 rounded-2xl border-2 border-primary bg-card relative hover:shadow-glow transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$29.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Unlimited trades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Unlimited dreams</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Calendar view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Export data</span>
              </li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>Get Started</Button>
          </div>

          <div className="p-8 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all">
            <h3 className="text-2xl font-bold mb-2">Elite</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$99.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Custom strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Advanced goal tracking</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-20 p-12 rounded-2xl border border-primary/20 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Plan?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact us for enterprise solutions and custom pricing tailored to your trading needs.
            </p>
            <Button size="lg" variant="outline">Contact Sales</Button>
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
