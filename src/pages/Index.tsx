import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import heroBanner from "@/assets/landing/background/hero-banner.png";
import { supabase } from "@/integrations/supabase/client";
export default function Index() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Generate floating particles
  const particles = useMemo(() => {
    return Array.from({
      length: 40
    }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      delay: Math.random() * 8,
      duration: 15 + Math.random() * 20,
      opacity: 0.4 + Math.random() * 0.6,
      driftX: (Math.random() - 0.5) * 120,
      driftY: Math.random() * 80 + 30
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
      const {
        error
      } = await (supabase.from("waitlist_signups" as any) as any).insert({
        email,
        source: "landing"
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
  return <div className="relative w-full min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Header - fixed, transparent, centered */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-[5%] py-4 flex items-center justify-center gap-8">
          
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Features</a>
            <a href="#analytics" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Analytics</a>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Playbooks</button>
            <button type="button" onClick={() => navigate("/pricing")} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">
              Pricing
            </button>
          </nav>

          <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:border-white/40" onClick={() => navigate("/auth")}>
                Log in
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative w-full">
        {/* Hero Section - Stretched banner image */}
        <section className="w-full">
          <img src={heroBanner} alt="" className="block w-full h-auto select-none" draggable={false} />
        </section>

        {/* Floating particles - spans entire page below hero */}
        <div className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 1 }}>
          {particles.map(particle => <div key={particle.id} className="lucid-particle" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--drift-x': `${particle.driftX}px`,
            '--drift-y': `${particle.driftY}px`
          } as React.CSSProperties} />)}
        </div>

        {/* Content section */}
        <section id="features" className="relative w-full py-16 lg:py-20 bg-[hsl(var(--background))]">
          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-[5%] text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-serif" style={{ color: '#030712', textShadow: '-1px -1px 0 hsl(212,98%,62%), 1px -1px 0 hsl(212,98%,62%), -1px 1px 0 hsl(212,98%,62%), 1px 1px 0 hsl(212,98%,62%), 0 -1px 0 hsl(212,98%,62%), 0 1px 0 hsl(212,98%,62%), -1px 0 0 hsl(212,98%,62%), 1px 0 0 hsl(212,98%,62%)' }}>WELCOME TO TRADE PEAKS</h1>
            
            <p className="text-muted-foreground max-w-2xl text-base md:text-lg mb-10">
              Transform your trading journey with TP. Track every trade, build your dreams, and reach the summit with our trading journal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-medium" onClick={() => setWaitlistOpen(true)}>
                Get Started
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary px-8 py-6 text-base font-medium" onClick={() => navigate("/dashboard")}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <FeatureShowcase />

        {/* Final CTA */}
        <section id="analytics" className="relative w-full py-20 lg:py-24 bg-[hsl(var(--background))]">
          <div className="relative z-10 flex items-center justify-center px-[5%]">
            <Card className="max-w-3xl w-full bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Ready to climb?
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] rounded-full mb-8 mx-auto" />
              
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg mb-12 leading-relaxed">
                Join traders who are building real edge through discipline, data, and deliberate practice.
              </p>

              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-medium shadow-[var(--shadow-glow)] transition-all duration-300 hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)]" onClick={() => setWaitlistOpen(true)}>
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
    </div>;
}