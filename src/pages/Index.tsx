import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ArrowRight, BarChart3, CalendarDays, BookOpen, Shield, Target, Eye } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import heroBanner from "@/assets/landing/background/hero-banner.png";
import { supabase } from "@/integrations/supabase/client";

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
      const { error } = await (supabase.from("waitlist_signups" as any) as any).insert({ email, source: "landing" });
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

  const heroPoints = [
    { text: "Journal every trade.", sub: "Turn discipline into consistency." },
    { text: "Analyse your performance.", sub: "Know exactly what drives your edge." },
    { text: "Build your playbook.", sub: "Define, tag, and refine winning setups." },
    { text: "Track prop firms.", sub: "Capital, evaluations, funded accounts." },
    { text: "Visualise your dreams.", sub: "Connect daily trading to real goals." },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-[5%] py-4 flex items-center justify-center gap-8">
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Features</a>
            <a href="#analytics" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Analytics</a>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Playbooks</button>
            <button type="button" onClick={() => navigate("/pricing")} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Pricing</button>
          </nav>
          <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:border-white/40" onClick={() => navigate("/auth")}>
            Log in
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative w-full">
        {/* Hero Banner Image */}
        <section className="w-full">
          <img src={heroBanner} alt="" className="block w-full h-auto select-none" draggable={false} />
        </section>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 1 }}>
          {particles.map(particle => (
            <div key={particle.id} className="lucid-particle" style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              '--drift-x': `${particle.driftX}px`,
              '--drift-y': `${particle.driftY}px`,
            } as React.CSSProperties} />
          ))}
        </div>

        {/* Hero Content Section - Side by side like TradeZella */}
        <section id="features" className="relative w-full py-12 lg:py-16 bg-[hsl(var(--background))]">
          <div className="relative z-10 max-w-7xl mx-auto px-[5%]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* Left: Text content */}
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-foreground">Everything you need to </span>
                  <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                    master your trading
                  </span>
                </motion.h1>

                <motion.p
                  className="text-muted-foreground text-lg md:text-xl mb-8 leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  TradePeaks shows you the metrics that matter — and the behaviours that lead to profit.
                </motion.p>

                <motion.div
                  className="space-y-3 mb-10"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {heroPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-base md:text-lg">
                        <span className="font-semibold text-foreground">{point.text}</span>{" "}
                        <span className="text-muted-foreground">{point.sub}</span>
                      </p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)] transition-all duration-300"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary px-8 py-6 text-base font-medium"
                    onClick={() => navigate("/dashboard")}
                  >
                    Explore Dashboard
                  </Button>
                </motion.div>
              </div>

              {/* Right: Quick feature highlights grid */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {[
                  { icon: CalendarDays, title: "Trade Calendar", desc: "Visual P&L calendar with color-coded days, streaks, and session breakdowns" },
                  { icon: BarChart3, title: "Advanced Analytics", desc: "Equity curves, win-rate by session, risk-reward distributions and more" },
                  { icon: BookOpen, title: "Playbook Builder", desc: "Define setups, tag trades, and see which strategies actually make money" },
                  { icon: Eye, title: "Daily Reviews", desc: "Guided slide-based reviews with screenshots, annotations, and lessons" },
                  { icon: Shield, title: "Risk Management", desc: "Pre-trade checklists and custom rules that enforce discipline every time" },
                  { icon: Target, title: "Dream Builder", desc: "Map out financial goals and connect daily trading to your bigger vision" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="group rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/70 transition-all duration-400"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-all">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Waitlist inline section */}
        {waitlistOpen && (
          <section className="relative w-full py-8 bg-[hsl(var(--background))]">
            <div className="max-w-md mx-auto px-[5%]">
              <Card className="bg-card/50 border-border/50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3">Join the Waitlist</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="you@email.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitWaitlist()}
                    className="flex-1"
                  />
                  <Button onClick={submitWaitlist} disabled={waitlistLoading} className="bg-primary text-primary-foreground">
                    {waitlistLoading ? "..." : "Join"}
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Feature Showcase */}
        <FeatureShowcase />

        {/* Final CTA */}
        <section id="analytics" className="relative w-full py-16 lg:py-20 bg-[hsl(var(--background))]">
          <div className="relative z-10 flex items-center justify-center px-[5%]">
            <Card className="max-w-3xl w-full bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm p-10 md:p-14 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Ready to climb?
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] rounded-full mb-6 mx-auto" />
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
                Join traders who are building real edge through discipline, data, and deliberate practice.
              </p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-medium shadow-[var(--shadow-glow)] transition-all duration-300 hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)]"
                onClick={() => setWaitlistOpen(true)}
              >
                Start Free Trial Today
              </Button>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712]">
        <div className="w-full text-center text-white/30 py-8 text-sm">
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
