import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <span className="text-xl font-bold">HS Journal</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6 animate-fade-in">
              <img src={logo} alt="HS-Edge" className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-fade-in">
              Your Gamified, Dream-Driven Path to Trading Excellence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Transform your trading journey with HS Journal. Track every trade, build your dreams, and level up your skills with our gamified trading journal.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg border border-border bg-card hover:shadow-glow transition-all">
              <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
                <Trophy className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gamified Progress</h3>
              <p className="text-muted-foreground">
                Earn achievements, level up, and track your trading milestones with our gamification system.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-border bg-card hover:shadow-glow transition-all">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dream Builder</h3>
              <p className="text-muted-foreground">
                Define your trading dreams, set milestones, and visualize your path to success.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-border bg-card hover:shadow-glow transition-all">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Deep insights into your trading patterns, win rates, and performance metrics.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
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
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl border border-primary/20 bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <div className="relative">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Trading?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join HS Journal today and start your journey to becoming a consistently profitable trader.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                Start Free Today
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 HS Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
