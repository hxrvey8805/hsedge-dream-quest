import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  ArrowRight,
  BarChart3,
  Clock,
  LayoutDashboard,
  LineChart,
  Mail,
  ShieldAlert,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";

import logo from "@/assets/tp-logo.png";
import bg1 from "@/assets/landing/background/background1.png";
import bg2 from "@/assets/landing/background/background2.png";
import bg3 from "@/assets/landing/background/background3.png";

import { supabase } from "@/integrations/supabase/client";

type Particle = {
  id: number;
  baseX: number;
  baseY: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  magnetStrength: number;
};

export default function Index() {
  const navigate = useNavigate();

  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const lucidParticles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 22 + Math.random() * 20,
        size: Math.random() * 5 + 2.5,
        opacity: 0.18 + Math.random() * 0.22,
        driftX: Math.random() * 140 - 70,
        driftY: Math.random() * 120 + 40,
        magnetStrength: 0.12 + Math.random() * 0.18,
      })),
    []
  );

  const getParticleOffset = (p: Particle) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const px = (p.baseX / 100) * rect.width;
    const py = (p.baseY / 100) * rect.height;
    const dx = mousePos.x - px;
    const dy = mousePos.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 320;
    const strength = Math.max(0, 1 - dist / maxDist) * p.magnetStrength;
    return { x: dx * strength * 0.5, y: dy * strength * 0.5 };
  };

  const submitWaitlist = async () => {
    const email = waitlistEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setWaitlistLoading(true);

      // Type assertion needed until types regenerate
      const { error } = await (supabase.from("waitlist_signups" as any) as any).insert({ email, source: "landing" });

      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || "";
        const code = (error as any)?.code;
        if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
          toast.success("You’re already on the waitlist.");
          setWaitlistOpen(false);
          setWaitlistEmail("");
          return;
        }
        console.error(error);
        toast.error("Couldn’t join the waitlist — try again.");
        return;
      }

      toast.success("You’re on the TradePeaks waitlist.");
      setWaitlistOpen(false);
      setWaitlistEmail("");
    } catch (e) {
      console.error(e);
      toast.error("Couldn’t join the waitlist — try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050A14] relative overflow-hidden">
      {/* Background stack — sized to match preview */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Background 1: Moon and mountains - hero area */}
        <div
          className="absolute top-0 left-0 right-0 h-[100vh] bg-no-repeat bg-top bg-cover"
          style={{ backgroundImage: `url(${bg1})` }}
        />
        {/* Background 2: Forest/trees - mid section */}
        <div
          className="absolute top-[85vh] left-0 right-0 h-[80vh] bg-no-repeat bg-top bg-cover"
          style={{ backgroundImage: `url(${bg2})` }}
        />
        {/* Background 3: Bottom section */}
        <div
          className="absolute top-[150vh] left-0 right-0 h-[80vh] bg-no-repeat bg-top bg-cover"
          style={{ backgroundImage: `url(${bg3})` }}
        />

        {/* Seamless blends between slices */}
        <div className="absolute top-[80vh] left-0 right-0 h-[15vh] bg-gradient-to-b from-transparent via-[#050A14]/60 to-[#050A14]/80" />
        <div className="absolute top-[145vh] left-0 right-0 h-[15vh] bg-gradient-to-b from-transparent via-[#050A14]/60 to-[#050A14]/80" />
        
        {/* Bottom fade to solid */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#050A14] via-[#050A14]/90 to-transparent" />
        
        {/* Subtle glow effects */}
        <div className="absolute bottom-0 left-0 right-0 h-[30vh] opacity-30 blur-3xl bg-[radial-gradient(closest-side_at_50%_90%,rgba(76,201,255,0.2),transparent)]" />

        {/* Vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, transparent 50%, rgba(5,10,20,0.3) 75%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Moon glow enhancement */}
        <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_5%,rgba(96,165,250,0.15),transparent_50%)]" />
      </div>
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {lucidParticles.map((p) => {
          const o = getParticleOffset(p);
          return (
            <div
              key={p.id}
              className="lucid-particle"
              style={
                {
                  left: `${p.baseX}%`,
                  top: `${p.baseY}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                  "--drift-x": `${p.driftX}px`,
                  "--drift-y": `${p.driftY}px`,
                  transform: `translate(${o.x}px, ${o.y}px)`,
                  transition: "transform 0.25s ease-out",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Header — transparent, floating on background */}
      <header className="sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-8 w-8" />
            <span className="text-[15px] font-semibold text-white">TradePeaks</span>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-blue-100/80 hover:text-white transition">Features</a>
            <a href="#analysis" className="text-sm text-blue-100/80 hover:text-white transition">Analysis</a>
            <a href="#why" className="text-sm text-blue-100/80 hover:text-white transition">Why TradePeaks</a>
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="text-sm text-blue-100/80 hover:text-white transition"
            >
              Pricing
            </button>

            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600/25 text-blue-100 hover:bg-blue-600/35 border border-blue-400/25 shadow-lg shadow-blue-500/20">
                  Join Waitlist
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
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-black/40 border-blue-500/25 text-blue-50 placeholder:text-blue-100/40"
                      />
                      <Button
                        onClick={submitWaitlist}
                        disabled={waitlistLoading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                      >
                        {waitlistLoading ? (
                          "Joining…"
                        ) : (
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
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10">
        {/* HERO — text floating directly on background */}
        <section className="min-h-[70vh] flex items-center justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-6xl mx-auto">
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-center mb-6">
                  <img
                    src={logo}
                    alt="TradePeaks"
                    className="h-24 w-24 md:h-32 md:w-32 drop-shadow-[0_0_60px_rgba(59,130,246,0.7)]"
                  />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-center">
                  Track Your Trades. Find Your Edge.
                </h1>
                <p className="mt-2 text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 text-center">
                  Climb Faster.
                </p>
                <p className="mt-4 text-sm md:text-base text-white/75 max-w-xl mx-auto text-center">
                  A leading journal built for momentum and peak traders — reports your emotions, guides your missions, and shows you exactly where your performance peaks.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Start Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                    onClick={() => navigate("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Your Dashboard
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="bg-black/55 backdrop-blur-xl border border-blue-500/25 shadow-[0_0_40px_rgba(59,130,246,0.12)] overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-blue-100/60">Today's Score</p>
                        <p className="text-2xl font-semibold text-white">
                          8.2 <span className="text-sm text-blue-100/60">/ 10</span>
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600/50 to-cyan-400/40 border border-blue-500/25" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-black/40 px-3 py-2.5">
                        <span className="text-sm text-blue-100/80">Wins / Losses</span>
                        <span className="text-sm font-medium text-white">8.2/10</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-black/40 px-3 py-2.5">
                        <span className="text-sm text-blue-100/80">Mindset</span>
                        <span className="text-sm font-medium text-white">Neutral</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-black/40 px-3 py-2.5">
                        <span className="text-sm text-blue-100/80">First 30 Minutes</span>
                        <span className="text-sm font-medium text-white">On track</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-black/40 px-3 py-2.5">
                        <span className="text-sm text-blue-100/80">Risk/Reward Ratio Check</span>
                        <span className="text-sm font-medium text-white">✓</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 pb-10 scroll-mt-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                {[
                  { icon: <Trophy className="h-5 w-5 text-blue-200" />, title: "Climb Higher", desc: "Every trade is a step. Track progress and improve faster." },
                  { icon: <Target className="h-5 w-5 text-cyan-200" />, title: "The Summit Awaits", desc: "Define your edge and map the journey to consistency." },
                  { icon: <TrendingUp className="h-5 w-5 text-sky-200" />, title: "Read the Terrain", desc: "See where your results peak: time windows, setups, habits." },
                ].map((c) => (
                  <Card key={c.title} className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-5">
                    <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                      {c.icon}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-blue-50">{c.title}</h3>
                    <p className="mt-2 text-sm text-blue-100/75">{c.desc}</p>
                  </Card>
                ))}
          </div>
        </section>

        {/* Analysis — chart/analytics teaser */}
        <section id="analysis" className="container mx-auto px-4 pb-10 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Analysis</h3>
              </div>
              <p className="text-blue-100/80 max-w-2xl">
                Deep insights and analytics — see where your performance peaks with setup-based stats, peak windows, and real-time trade reports.
              </p>
            </Card>
          </div>
        </section>

        {/* Why TradePeaks — opaque dark glass, centered heading */}
        <section id="why" className="container mx-auto px-4 py-10 scroll-mt-20">
          <h3 className="text-center text-2xl md:text-3xl font-semibold text-white mb-8">Why TradePeaks</h3>
          <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <Card className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-6">
                <h4 className="text-lg font-semibold text-white">Performance that's actually tradable</h4>
                <div className="mt-5 space-y-3">
                  {[
                    "Data-driven equity & HF-based insights",
                    "My trade journal window",
                    "Deep insights analytics",
                    "Real-time, virtual + reality",
                    "Push trade & full reports",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-blue-100/80">
                      <span className="text-cyan-400">✓</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Join Waitlist
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                    onClick={() => navigate("/dashboard")}
                  >
                    Start Your Trading Journey
                  </Button>
                </div>
              </Card>
            </div>

            <div className="md:col-span-7">
              <Card className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-6">
                <div className="text-xs uppercase tracking-widest text-blue-100/55">Dashboard Preview</div>
                <div className="mt-3 h-[260px] rounded-xl border border-blue-500/20 bg-black/40 flex items-center justify-center">
                  <span className="text-sm text-blue-100/55">Drop in your dashboard screenshot here later</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* System steps — opaque cards */}
        <section className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-center text-2xl font-semibold text-blue-50">The TradePeaks System</h3>
            <p className="mt-2 text-center text-blue-100/75">Import → Tag → Improve. Every day.</p>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                { n: "1", title: "Import", desc: "CSV or manual — get trades in fast." },
                { n: "2", title: "Tag", desc: "Setup, session, timeframe, notes, rule breaks." },
                { n: "3", title: "Improve", desc: "Review, spot patterns, build consistency." },
              ].map((s) => (
                <Card key={s.n} className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-6">
                  <div className="text-sm text-blue-100/65">Step {s.n}</div>
                  <div className="mt-2 text-lg font-semibold text-blue-50">{s.title}</div>
                  <div className="mt-2 text-sm text-blue-100/75">{s.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA — opaque dark glass */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="bg-black/55 backdrop-blur-xl border border-blue-500/25 p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <Zap className="h-10 w-10 text-cyan-200 mx-auto" />
              <h3 className="mt-4 text-2xl font-semibold text-blue-50">But why?</h3>
              <p className="mt-3 text-blue-100/75">
                While others stay in the feeding grounds, some traders are drawn to the mountains.
                Get early access to TradePeaks.
              </p>
              <div className="mt-6">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                  onClick={() => setWaitlistOpen(true)}
                >
                  Join Waitlist <ArrowRight className="h-4 w-4 ml-2 inline" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t border-blue-500/15 bg-black/25 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-10 text-center text-blue-200/50 text-sm">
            © {new Date().getFullYear()} TradePeaks. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
