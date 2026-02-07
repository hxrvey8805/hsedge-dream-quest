import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Mountain, Target, LineChart } from "lucide-react";
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
                    <Input id="waitlistEmail" value={waitlistEmail} onChange={e => setWaitlistEmail(e.target.value)} placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 transition-colors" />
                    <Button onClick={submitWaitlist} disabled={waitlistLoading} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/25 transition-all duration-300">
                      {waitlistLoading ? "Joining…" : <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Join
                        </span>}
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
        <section id="features" className="relative w-full py-12 lg:py-16 bg-[#030712]">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-[5%] text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-serif" style={{ WebkitTextStroke: '1.5px hsl(212, 98%, 62%)', color: 'transparent' }}>WELCOME TO TRADE PEAKS</h1>
            
            <p className="text-white/60 max-w-2xl text-base md:text-lg mb-10">
              Transform your trading journey with TP. Track every trade, build your dreams, and reach the summit with our trading journal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-medium" onClick={() => setWaitlistOpen(true)}>
                Get Started
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-base font-medium" onClick={() => navigate("/dashboard")}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="relative w-full py-16 lg:py-24 bg-[#030712]">
          <div className="relative z-10 px-[5%]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/5 border-white/10 p-6">
                <Mountain className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Climb Higher</h3>
                <p className="text-white/60 text-sm">
                  Each trade is a step up the mountain. Track your ascent and reach new peaks.
                </p>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <Target className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">The Summit Awaits</h3>
                <p className="text-white/60 text-sm">
                  Chart your course to the peaks. Define your destination and map the journey.
                </p>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <LineChart className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Read the Terrain</h3>
                <p className="text-white/60 text-sm">
                  Understand every ridge and valley of your trading journey. See the path clearly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* But Why Section */}
        <section id="analytics" className="relative w-full py-16 lg:py-24 bg-[#030712]">
          <div className="relative z-10 flex flex-col items-center justify-center px-[5%] text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              But why?
            </h2>
            
            <p className="text-white/60 max-w-xl text-base md:text-lg mb-10">
              While others stay in the feeding grounds, some traders are drawn to the mountains. Find out what waits at the summit.
            </p>

            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-medium" onClick={() => setWaitlistOpen(true)}>
              Start Free Trial Today
            </Button>
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