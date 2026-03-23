import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, ClipboardCheck, Gauge, Mountain } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { supabase } from "@/integrations/supabase/client";

const proofCards = [
  { icon: ClipboardCheck, title: "Daily Report Card", desc: "Structured reflection that forces growth every session." },
  { icon: Gauge, title: "Edge Clarity", desc: "Know which setups, sessions, and habits drive your P&L." },
  { icon: Mountain, title: "Dream Builder", desc: "Connect daily execution to the life you're trading for." },
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

  const openWaitlist = () => setWaitlistOpen(true);

  return (
    <div className="relative w-full min-h-screen bg-background overflow-x-hidden">
      {/* Announcement Bar */}
      <div className="relative z-50 w-full bg-primary/10 border-b border-primary/20 py-2.5 text-center">
        <p className="text-sm font-medium text-primary tracking-wide">
          Early access is live — <span className="text-foreground font-semibold">Join the waitlist today</span>
        </p>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 py-5 flex items-center justify-center gap-10">
          <nav className="flex items-center gap-8">
            <a href="#system" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">System</a>
            <a href="#analytics" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">Analytics</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-base text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">Pricing</button>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-base text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">Playbooks</button>
          </nav>
          <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-full px-6 py-2.5 text-base font-semibold transition-all duration-300 shadow-glow hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)]" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative w-full">
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

        {/* Hero Section — massive stacked headline */}
        <section className="relative w-full pt-32 pb-20 lg:pt-40 lg:pb-32 bg-background overflow-hidden">
          {/* Background glow orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, hsl(212 98% 62%) 0%, transparent 70%)', filter: 'blur(100px)' }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(212 98% 70%) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left — Stacked headline */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="mb-10">
                  <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-black leading-[0.9] tracking-tight">
                    <span className="block text-foreground">Define.</span>
                    <span className="block text-foreground">Trade.</span>
                    <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent" style={{ textShadow: 'none' }}>
                      Improve.
                    </span>
                  </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold shadow-glow hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)] transition-all duration-300 rounded-xl"
                    onClick={openWaitlist}
                  >
                    Start Climbing <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary px-10 py-6 text-lg font-medium rounded-xl"
                    onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    See How It Works
                  </Button>
                </div>

                {/* Waitlist inline */}
                {waitlistOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card className="bg-card/50 border-border/50 p-6 backdrop-blur-sm max-w-md">
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
                  </motion.div>
                )}
              </motion.div>

              {/* Right — description + proof cards */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="lg:pt-8"
              >
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4">
                  The performance system for traders who want{" "}
                  <span className="text-foreground font-semibold">direction, not noise.</span>
                </p>
                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  TradePeaks is a structured daily performance system designed to help you identify what truly matters, improve it deliberately, and see your progress over time.
                </p>

                <div className="flex flex-col gap-3">
                  {proofCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      >
                        <Card className="bg-card/30 border-border/40 backdrop-blur-sm p-5 hover:border-primary/30 transition-all duration-300 group">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-foreground mb-1">{card.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <p className="text-primary/80 text-sm font-medium italic mt-6">
                  This is where traders stop reacting — and start climbing.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Showcase (all remaining sections) */}
        <FeatureShowcase onStartClimbing={openWaitlist} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 text-center text-muted-foreground py-8 text-sm">
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
