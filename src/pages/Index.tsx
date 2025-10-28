import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";
import heroLogo from "@/assets/hsjournal-2.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <span className="text-xl font-bold"></span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
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
            <div className="inline-flex mb-6 animate-fade-in">
              <img src={heroLogo} alt="HS Journal" className="h-32 w-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-fade-in">
              Your Gamified, Dream-Driven Path to Trading Excellence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Transform your trading journey with HS Journal. Track every trade, build your dreams, and level up your
              skills with our gamified trading journal.
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
                Start Free Trial Today
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
