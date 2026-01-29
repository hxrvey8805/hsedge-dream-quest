import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap, Mail, ArrowRight, Clock, ShieldAlert, LineChart } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import bg1 from "@/assets/landing/background/background1.png";
import bg2 from "@/assets/landing/background/background2.png";
import bg3 from "@/assets/landing/background/background3.png";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const submitWaitlist = async () => {
    const email = waitlistEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setWaitlistLoading(true);

      const { error } = await supabase
        .from("waitlist_signups")
        .insert({ email, source: "landing" });

      // Duplicate email = treat as success (unique index triggers 23505)
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

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate deep blue illuminated floating particles (subtler, premium)
  const lucidParticles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 28 + Math.random() * 30,
      size: Math.random() * 6 + 3,
      opacity: 0.25 + Math.random() * 0.25,
      driftX: Math.random() * 150 - 75,
      driftY: Math.random() * 100 + 50,
      magnetStrength: 0.15 + Math.random() * 0.2,
    }));
  }, []);

  // Calculate magnetic offset for each particle
  const getParticleStyle = (particle: typeof lucidParticles[0]) => {
    if (!containerRef.current) return {
      x: 0,
      y: 0
    };
    const rect = containerRef.current.getBoundingClientRect();
    const particleX = particle.baseX / 100 * rect.width;
    const particleY = particle.baseY / 100 * rect.height;
    const dx = mousePos.x - particleX;
    const dy = mousePos.y - particleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Magnetic effect with falloff (stronger when closer, max range ~300px)
    const maxDistance = 350;
    const strength = Math.max(0, 1 - distance / maxDistance) * particle.magnetStrength;
    return {
      x: dx * strength * 0.5,
      y: dy * strength * 0.5
    };
  };
    return (
    <div ref={containerRef} className="min-h-screen bg-[#070C1A] relative overflow-hidden">
      {/* Background image stack (preview split into 3) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-[55vh] bg-no-repeat bg-top bg-cover opacity-80"
          style={{ backgroundImage: `url(${bg1})` }}
        />
        <div
          className="absolute top-[55vh] left-0 right-0 h-[55vh] bg-no-repeat bg-center bg-cover opacity-80"
          style={{ backgroundImage: `url(${bg2})` }}
        />
        <div
          className="absolute top-[110vh] left-0 right-0 h-[70vh] bg-no-repeat bg-bottom bg-cover opacity-90"
          style={{ backgroundImage: `url(${bg3})` }}
        />
        {/* Seam blend overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A14]/70 via-transparent to-[#050A14]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(80rem_40rem_at_50%_-10%,rgba(76,201,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_110%,rgba(46,107,255,0.10),transparent_60%)]" />
      </div>

      {/* Fog / smoke layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-[#050A14]/95 via-[#050A14]/55 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-30 blur-2xl bg-[radial-gradient(closest-side_at_50%_80%,rgba(76,201,255,0.20),transparent)]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {lucidParticles.map(particle => {
        const magnetOffset = getParticleStyle(particle);
        return <div key={particle.id} className="lucid-particle" style={{
          left: `${particle.baseX}%`,
          top: `${particle.baseY}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity,
          '--drift-x': `${particle.driftX}px`,
          '--drift-y': `${particle.driftY}px`,
          transform: `translate(${magnetOffset.x}px, ${magnetOffset.y}px)`,
          transition: 'transform 0.3s ease-out'
        } as React.CSSProperties} />;
      })}
      </div>
      
      <header className="border-b border-blue-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-10 w-10" />
            <span className="text-xl font-bold text-blue-100/90">TradePeaks</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" className="text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30">
                  Join Waitlist
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[520px] bg-[#050A14] border border-blue-500/20 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-xl">Join the TradePeaks waitlist</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm text-blue-100/70">
                    We're polishing onboarding. Drop your email and you'll be first in when it opens.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="waitlistEmail" className="text-blue-100/80">Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="waitlistEmail"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-black/30 border-blue-500/20 text-blue-50 placeholder:text-blue-100/40"
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

                    <p className="text-xs text-blue-100/50">
                      No spam. One email when onboarding opens.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left: hero copy */}
              <div className="md:col-span-7 text-center md:text-left">
                <div className="mb-8 animate-fade-in">
                  <h1
                    className="text-7xl md:text-8xl font-light italic"
                    style={{
                      fontFamily: "'Playfair Display', 'Dancing Script', 'Georgia', serif",
                      background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #22d3ee 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 60px rgba(59, 130, 246, 0.6), 0 0 120px rgba(34, 211, 238, 0.3)",
                      letterSpacing: "0.08em",
                      fontWeight: 300,
                      filter: "drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))",
                    }}
                  >
                    TradePeaks
                  </h1>
                </div>

                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent animate-fade-in">
                  Track Your Trades. Find Your Edge. Climb Faster.
                </h2>

                <p className="text-xl text-blue-100/80 mb-8 animate-fade-in">
                  A performance-first trading journal for momentum and scalp traders — tag setups, spot rule breaks, and see exactly where your results peak.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    <span className="inline-flex items-center gap-2">
                      Join Waitlist <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-400/30 text-blue-200 hover:bg-blue-500/10 hover:border-blue-400/50"
                    onClick={() => navigate("/pricing")}
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Right: Today's Score (demo snapshot) */}
              <div className="md:col-span-5">
                <Card className="relative overflow-hidden border border-blue-500/20 bg-black/35 backdrop-blur-xl shadow-[0_0_60px_rgba(59,130,246,0.18)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-blue-100/60">Today's Score</p>
                        <p className="text-2xl font-semibold text-blue-50">
                          8.2 <span className="text-sm text-blue-100/60">/ 10</span>
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600/40 to-cyan-400/30 border border-blue-500/25" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-blue-500/15 bg-blue-950/30 p-3">
                        <div className="flex items-center gap-2 text-blue-100/70 text-xs">
                          <LineChart className="h-3.5 w-3.5" /> Best Setup
                        </div>
                        <div className="mt-1 text-sm font-medium text-blue-50">Pullback</div>
                      </div>

                      <div className="rounded-xl border border-blue-500/15 bg-blue-950/30 p-3">
                        <div className="flex items-center gap-2 text-blue-100/70 text-xs">
                          <Clock className="h-3.5 w-3.5" /> Peak Window
                        </div>
                        <div className="mt-1 text-sm font-medium text-blue-50">14:32–14:51</div>
                      </div>

                      <div className="rounded-xl border border-blue-500/15 bg-blue-950/30 p-3 col-span-2">
                        <div className="flex items-center gap-2 text-blue-100/70 text-xs">
                          <ShieldAlert className="h-3.5 w-3.5" /> Flag
                        </div>
                        <div className="mt-1 text-sm font-medium text-blue-50">Chased extension (1x)</div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-xs text-blue-100/55">Demo snapshot — live scoring opens with onboarding.</p>
                      <button
                        type="button"
                        onClick={() => setWaitlistOpen(true)}
                        className="text-xs text-cyan-200/80 hover:text-cyan-200 underline underline-offset-4"
                      >
                        Get early access
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-blue-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:border-blue-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Climb Higher</h3>
              <p className="text-blue-100/70">
                Each trade is a step up the mountain. Track your ascent and reach new peaks.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-cyan-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:border-cyan-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                <Target className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">The Summit Awaits</h3>
              <p className="text-cyan-100/70">
                Chart your course to the peaks. Define your destination and map the journey.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-sky-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(14,165,233,0.25)] hover:border-sky-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all">
                <TrendingUp className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Read the Terrain</h3>
              <p className="text-sky-100/70">
                Understand every ridge and valley of your trading journey. See the path clearly.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl border border-blue-500/30 bg-blue-950/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10"></div>
            <div className="relative">
              <Zap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">But why?</h2>
              <p className="text-xl text-blue-100/80 mb-8 italic font-light">While others stay in the feeding grounds, some traders are drawn to the mountains. Find out what waits at the summit.</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                onClick={() => setWaitlistOpen(true)}
              >
                <span className="inline-flex items-center gap-2">
                  Join Waitlist <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-500/30 bg-black/40 backdrop-blur-sm mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center text-blue-200/60">
          <p>© 2025 TradePeaks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
export default Index;