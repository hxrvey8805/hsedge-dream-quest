import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import heroBanner from "@/assets/landing/background/hero-banner.png";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Generate floating particles
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

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Header - fixed, transparent, centered */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030712]/60">
        <div className="w-full px-[5%] py-4 flex items-center justify-center gap-8">
          <img src={logo} alt="TradePeaks" className="h-6 w-6" />
          
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Features</a>
            <a href="#analytics" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Analytics</a>
            <a href="#playbooks" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Playbooks</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">
              Pricing
            </button>
          </nav>

          <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:border-white/40">
                Log in
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[520px] bg-[#0a0f1a]/95 backdrop-blur-2xl border border-white/10 text-foreground shadow-2xl shadow-blue-500/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Join the TradePeaks waitlist</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-white/50 leading-relaxed">
                  We're polishing onboarding. Drop your email and you'll be first in when it opens.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="waitlistEmail" className="text-white/60 text-sm">
                    Email
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      id="waitlistEmail"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 transition-colors"
                    />
                    <Button
                      onClick={submitWaitlist}
                      disabled={waitlistLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                      {waitlistLoading ? "Joining…" : (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Join
                        </span>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-white/40">No spam. One email when onboarding opens.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full">
        {/* Hero Section - Stretched banner image */}
        <section className="w-full">
          <img src={heroBanner} alt="" className="block w-full h-auto select-none" draggable={false} />
        </section>

        {/* Content section with floating particles background */}
        <section id="features" className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#030712] via-[#050a15] to-[#030712]">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                  '--drift-x': `${particle.driftX}px`,
                  '--drift-y': `${particle.driftY}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Hero content */}
          <div className="relative z-10 flex items-center justify-center px-[5%] py-20 lg:py-28">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <motion.div 
                className="lg:col-span-7 text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Eyebrow */}
                <motion.p 
                  className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-400/80 font-medium mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Trading Journal for Scalpers
                </motion.p>

                {/* Main headline */}
                <h1 className="font-bold leading-[1.1] tracking-tight">
                  <span 
                    className="block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent"
                    style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
                  >
                    Track Your Trades.
                  </span>
                  <span 
                    className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mt-1"
                    style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
                  >
                    Find Your Edge.
                  </span>
                  <span 
                    className="block text-white/40 font-light mt-2"
                    style={{ fontSize: 'clamp(20px, 3vw, 40px)' }}
                  >
                    Climb Faster.
                  </span>
                </h1>

                {/* Description */}
                <motion.p 
                  className="text-white/50 max-w-xl mx-auto lg:mx-0 leading-relaxed mt-8"
                  style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  A trading journal built for momentum and scalp traders—imports your executions,
                  grades your process, and shows you exactly where your performance peaks.
                </motion.p>

                {/* CTAs */}
                <motion.div 
                  className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Button
                    className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-xl shadow-blue-500/25 rounded-full px-8 py-6 text-base font-semibold transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-full px-8 py-6 text-base font-medium transition-all duration-300 backdrop-blur-sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    View Dashboard
                  </Button>
                </motion.div>

                {/* Feature pills */}
                <motion.div 
                  className="flex flex-wrap justify-center lg:justify-start gap-3 mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {["Auto-imports executions", "Setup tagging", "Playbooks", "Real stats"].map((feature, i) => (
                    <span 
                      key={i}
                      className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10 backdrop-blur-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              {/* Score Card */}
              <motion.div 
                className="lg:col-span-5 flex justify-center lg:justify-end"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              >
                <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 w-full max-w-sm p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">Today's Score</p>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Discipline", value: "8.2 / 10", accent: true },
                      { label: "Best Setup", value: "Pullback" },
                      { label: "Peak Window", value: "14:32 – 14:51" },
                      { label: "Mistake Flag", value: "Chased extension", warn: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.warn ? 'bg-amber-400' : item.accent ? 'bg-cyan-400' : 'bg-white/30'}`} />
                          <span className="text-sm text-white/50">{item.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${item.warn ? 'text-amber-400/80' : item.accent ? 'text-white' : 'text-white/70'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why TradePeaks section */}
        <section id="analytics" className="relative w-full min-h-[60vh] bg-[#030712]">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
          
          {/* More floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.slice(0, 25).map((particle) => (
              <div
                key={`why-${particle.id}`}
                className="lucid-particle"
                style={{
                  left: `${(particle.x + 30) % 100}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity * 0.8,
                  animationDelay: `${particle.delay + 2}s`,
                  animationDuration: `${particle.duration}s`,
                  '--drift-x': `${particle.driftX}px`,
                  '--drift-y': `${particle.driftY}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col justify-center px-[5%] py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-400/60 font-medium mb-4">Why Choose Us</p>
              <h2 className="font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>
                Why TradePeaks
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 items-center mx-auto max-w-5xl gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="font-semibold text-white/90 leading-tight mb-8" style={{ fontSize: 'clamp(20px, 2.5vw, 32px)' }}>
                  Performance that's
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">actually tradable</span>
                </h3>

                <div className="space-y-4">
                  {[
                    "Expectancy by setup (R-based)",
                    "Win rate by time window",
                    "Best tickers + catalysts",
                    "Heatmaps: time + setup + volatility",
                    "Rule breaks & 'tilt' moments"
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center border border-cyan-400/30">
                        <span className="text-cyan-400 text-xs">✓</span>
                      </div>
                      <span className="text-white/60 text-base">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <Button
                  className="mt-10 bg-transparent border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 rounded-full px-6 py-5 text-sm font-medium transition-all duration-300"
                  onClick={() => navigate("/dashboard")}
                >
                  See a Live Example
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              <div className="hidden lg:block" />
            </div>
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
