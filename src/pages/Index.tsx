import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ArrowRight, BarChart3, Shield, Star } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import heroBanner from "@/assets/landing/background/hero-banner.png";
import { supabase } from "@/integrations/supabase/client";

const heroFeatures = [
  { bold: "Journal every trade.", rest: "Turn discipline into consistency." },
  { bold: "Analyze performance.", rest: "Know exactly what drives your edge." },
  { bold: "Build your playbook.", rest: "Define setups. Track what works." },
  { bold: "Track prop firms.", rest: "Capital, drawdowns, evaluations." },
  { bold: "Visualise your goals.", rest: "Connect trading to your dream life." },
];

export default function Index() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      delay: Math.random() * 8,
      duration: 15 + Math.random() * 20,
      opacity: 0.4 + Math.random() * 0.6,
      driftX: (Math.random() - 0.5) * 120,
      driftY: Math.random() * 80 + 30,
    }));
  }, []);

  const submitWaitlist = async () => {
    const email = waitlistEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      setWaitlistLoading(true);
      const { error } = await (supabase.from("waitlist_signups" as any) as any).insert({
        email,
        source: "landing",
      });
      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || "";
        const code = (error as any)?.code;
        if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
          toast.success("You're already on the waitlist.");
          setWaitlistOpen(false);
          setWaitlistEmail("");
          return;
        }
        console.error(error);
        toast.error("Couldn't join the waitlist — try again.");
        return;
      }
      toast.success("You're on the TradePeaks waitlist.");
      setWaitlistOpen(false);
      setWaitlistEmail("");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't join the waitlist — try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground tracking-tight">TradePeaks</span>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Analytics</a>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Playbooks</button>
            <button type="button" onClick={() => navigate("/pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>Log in</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative w-full">
        {/* Hero Section - Split layout */}
        <section className="relative w-full pt-24 pb-8 lg:pt-28 lg:pb-12 bg-[#030712]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Text content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-4 tracking-tight">
                  Everything you need to{" "}
                  <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                    master your trading
                  </span>
                  ...
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-xl">
                  TradePeaks shows you the metrics that matter — and the behaviours that lead to profit with the power of journaling and analytics.
                </p>

                {/* Feature bullets */}
                <ul className="space-y-3 mb-8">
                  {heroFeatures.map((f) => (
                    <li key={f.bold} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-base text-foreground">
                        <strong>{f.bold}</strong>{" "}
                        <span className="text-muted-foreground">{f.rest}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-base font-semibold shadow-[var(--shadow-glow)]"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary px-8 text-base"
                    onClick={() => navigate("/dashboard")}
                  >
                    See Demo
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <span className="ml-1 font-medium text-foreground">4.9</span>
                  </div>
                  <span className="text-border">|</span>
                  <span>Free to start</span>
                  <span className="text-border">|</span>
                  <span>No credit card required</span>
                </div>
              </motion.div>

              {/* Right: Hero image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
                  <img src={heroBanner} alt="TradePeaks trading journal dashboard" className="w-full h-auto" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 1 }}>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="lucid-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                  "--drift-x": `${particle.driftX}px`,
                  "--drift-y": `${particle.driftY}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </section>

        {/* Integrations strip */}
        <section className="w-full py-6 bg-[hsl(var(--secondary))] border-y border-border/30">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">Works with your trading setup</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["MetaTrader", "TradingView", "NinjaTrader", "Interactive Brokers", "Rithmic", "DXtrade", "cTrader"].map((name) => (
                <span key={name} className="px-4 py-1.5 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <FeatureShowcase />

        {/* Final CTA */}
        <section id="analytics" className="relative w-full py-16 lg:py-20 bg-[hsl(var(--background))]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Ready to trade with an edge?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Join traders who are building real consistency through discipline, data, and deliberate practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 text-base font-semibold shadow-[var(--shadow-glow)]"
                onClick={() => setWaitlistOpen(true)}
              >
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary px-8 text-base"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free plan available · No credit card required · Cancel anytime</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/playbooks")} className="hover:text-foreground transition-colors">Playbooks</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span>Trade Calendar</span></li>
                <li><span>Analytics</span></li>
                <li><span>Dream Builder</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span>Getting Started</span></li>
                <li><span>Support</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span>About</span></li>
                <li><span>Contact</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} TradePeaks. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Waitlist Dialog */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setWaitlistOpen(false)}>
          <Card className="w-full max-w-md p-8 bg-card border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-2">Join the waitlist</h3>
            <p className="text-sm text-muted-foreground mb-5">Be the first to know when TradePeaks launches.</p>
            <Input
              placeholder="your@email.com"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitWaitlist()}
              className="mb-4"
            />
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={submitWaitlist} disabled={waitlistLoading}>
              {waitlistLoading ? "Joining..." : "Join Waitlist"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
