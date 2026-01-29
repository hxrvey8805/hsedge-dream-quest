import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
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
    <div className="relative w-full min-h-screen bg-[#050A14] overflow-x-hidden">
      {/* Header - fixed, transparent, centered */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-[5%] py-[1.5%] flex items-center justify-center gap-[3%]">
          <img src={logo} alt="TradePeaks" className="h-[2vw] w-[2vw] min-h-[16px] min-w-[16px]" />
          
          <nav className="flex items-center gap-[2vw]">
            <a href="#features" className="text-blue-100/80 hover:text-white transition whitespace-nowrap" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>Features</a>
            <a href="#analytics" className="text-blue-100/80 hover:text-white transition whitespace-nowrap" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>Analytics</a>
            <a href="#playbooks" className="text-blue-100/80 hover:text-white transition whitespace-nowrap" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>Playbooks</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-blue-100/80 hover:text-white transition whitespace-nowrap" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
              Pricing
            </button>
          </nav>

          <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30 rounded-full" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)', padding: 'clamp(4px, 0.8vw, 8px) clamp(12px, 2vw, 20px)' }}>
                Log in
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[520px] bg-black/80 backdrop-blur-xl border border-blue-500/25 text-foreground">
              <DialogHeader>
                <DialogTitle className="text-xl">Join the TradePeaks waitlist</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-blue-100/70">
                  We're polishing onboarding. Drop your email and you'll be first in when it opens.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="waitlistEmail" className="text-blue-100/80">
                    Email
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      id="waitlistEmail"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-black/40 border-blue-500/25 text-blue-50 placeholder:text-blue-100/40"
                    />
                    <Button
                      onClick={submitWaitlist}
                      disabled={waitlistLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                    >
                      {waitlistLoading ? "Joining…" : (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Join
                        </span>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-blue-100/50">No spam. One email when onboarding opens.</p>
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
        <section id="features" className="relative w-full min-h-[80vh] bg-[#050A14]">
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

          {/* Hero content overlay */}
          <div className="relative z-10 flex items-center px-[5%] py-[8%]">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-[3%] items-center">
              <div className="lg:col-span-7 text-center lg:text-left">
                <h1 className="font-bold text-white leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 56px)' }}>
                  Track Your Trades. Find Your Edge.
                  <br />
                  <span className="text-white">Climb Faster.</span>
                </h1>

                <p className="text-blue-100/70 max-w-[90%] lg:max-w-[80%] mx-auto lg:mx-0" style={{ fontSize: 'clamp(12px, 1.5vw, 20px)', marginTop: 'clamp(12px, 2vw, 28px)' }}>
                  A trading journal built for momentum and scalp traders—imports your executions,
                  grades your process, and shows you exactly where your performance peaks.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start" style={{ gap: 'clamp(10px, 1.5vw, 20px)', marginTop: 'clamp(16px, 2.5vw, 36px)' }}>
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30"
                    onClick={() => setWaitlistOpen(true)}
                    style={{ fontSize: 'clamp(12px, 1.4vw, 18px)', padding: 'clamp(8px, 1.2vw, 16px) clamp(20px, 3vw, 40px)' }}
                  >
                    Start Free
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                    onClick={() => navigate("/dashboard")}
                    style={{ fontSize: 'clamp(12px, 1.4vw, 18px)', padding: 'clamp(8px, 1.2vw, 16px) clamp(20px, 3vw, 40px)' }}
                  >
                    View Dashboard
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start text-blue-100/50" style={{ gap: 'clamp(8px, 1.2vw, 16px)', marginTop: 'clamp(14px, 2vw, 28px)', fontSize: 'clamp(10px, 1.2vw, 16px)' }}>
                  <span>Auto-imports executions</span>
                  <span>·</span>
                  <span>Setup tagging + playbooks</span>
                  <span>·</span>
                  <span>Stats that actually matter</span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end mt-8 lg:mt-0">
                <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]" style={{ width: 'clamp(240px, 24vw, 360px)', padding: 'clamp(16px, 2vw, 32px)' }}>
                  <p className="uppercase tracking-widest text-blue-100/50" style={{ fontSize: 'clamp(9px, 1vw, 14px)', marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>Today's Score</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 14px)' }}>
                    {[
                      { label: "Discipline", value: "8.2 / 10" },
                      { label: "Best Setup", value: "Pullback" },
                      { label: "Peak Window", value: "14:32 – 14:51" },
                      { label: "Mistake Flag", value: "Chased extension" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: 'clamp(6px, 0.6vw, 10px)' }}>
                          <div className="rounded-full bg-cyan-400" style={{ width: 'clamp(5px, 0.6vw, 10px)', height: 'clamp(5px, 0.6vw, 10px)' }} />
                          <span className="text-blue-100/70" style={{ fontSize: 'clamp(10px, 1.1vw, 15px)' }}>{item.label}</span>
                        </div>
                        <span className="font-medium text-white" style={{ fontSize: 'clamp(10px, 1.1vw, 15px)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why TradePeaks section */}
        <section id="analytics" className="relative w-full min-h-[60vh] bg-[#050A14]">
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

          <div className="relative z-10 flex flex-col justify-center px-[5%] py-[6%]">
            <h2 className="font-semibold text-white text-center" style={{ fontSize: 'clamp(20px, 3vw, 42px)', marginBottom: 'clamp(24px, 3vw, 48px)' }}>
              Why TradePeaks
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 items-center mx-auto" style={{ gap: 'clamp(24px, 4vw, 64px)', maxWidth: '85%' }}>
              <div>
                <h3 className="font-semibold text-white" style={{ fontSize: 'clamp(16px, 2vw, 28px)', marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>
                  Performance that's<br />actually tradable
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 0.8vw, 12px)' }}>
                  {[
                    "Expectancy by setup (R-based)",
                    "Win rate by time window",
                    "Best tickers + catalysts",
                    "Heatmaps: time + setup + volatility",
                    "Rule breaks & 'tilt' moments"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center text-blue-100/80" style={{ gap: 'clamp(6px, 0.8vw, 12px)', fontSize: 'clamp(12px, 1.3vw, 18px)' }}>
                      <span className="text-cyan-400">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="bg-transparent border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  onClick={() => navigate("/dashboard")}
                  style={{ fontSize: 'clamp(11px, 1.3vw, 16px)', padding: 'clamp(8px, 1vw, 14px) clamp(16px, 2vw, 28px)', marginTop: 'clamp(16px, 2vw, 32px)' }}
                >
                  See a Live Example
                </Button>
              </div>

              <div className="hidden lg:block" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-500/15 bg-[#050A14]">
        <div className="w-full text-center text-blue-200/50" style={{ padding: 'clamp(24px, 4vw, 48px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
