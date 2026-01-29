import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { ArrowRight, Clock, LineChart, Mail, ShieldAlert, Target, Trophy, TrendingUp, Zap } from "lucide-react";

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
    [],
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

      const { error } = await supabase.from("waitlist_signups").insert({ email, source: "landing" });

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
      {/* Background stack (3 slices) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-[55vh] bg-no-repeat bg-top bg-cover opacity-85"
          style={{ backgroundImage: `url(${bg1})` }}
        />
        <div
          className="absolute top-[55vh] left-0 right-0 h-[55vh] bg-no-repeat bg-center bg-cover opacity-85"
          style={{ backgroundImage: `url(${bg2})` }}
        />
        <div
          className="absolute top-[110vh] left-0 right-0 h-[70vh] bg-no-repeat bg-bottom bg-cover opacity-95"
          style={{ backgroundImage: `url(${bg3})` }}
        />

        {/* Seam blend + moon glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A14]/65 via-transparent to-[#050A14]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(80rem_40rem_at_50%_-10%,rgba(76,201,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(45rem_25rem_at_50%_110%,rgba(46,107,255,0.10),transparent_60%)]" />

        {/* Fog */}
        <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-[#050A14]/95 via-[#050A14]/55 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-30 blur-2xl bg-[radial-gradient(closest-side_at_50%_80%,rgba(76,201,255,0.20),transparent)]" />
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
                  // @ts-expect-error css vars
                  "--drift-x": `${p.driftX}px`,
                  // @ts-expect-error css vars
                  "--drift-y": `${p.driftY}px`,
                  transform: `translate(${o.x}px, ${o.y}px)`,
                  transition: "transform 0.25s ease-out",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Header (preview-style: minimal + quiet) */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-8 w-8" />
            <span className="text-[15px] font-semibold text-blue-100/90">TradePeaks</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="text-sm text-blue-100/70 hover:text-blue-100 transition"
            >
              Pricing
            </button>

            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600/20 text-blue-100 hover:bg-blue-600/30 border border-blue-400/20">
                  Join Waitlist
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[520px] bg-[#050A14] border border-blue-500/20 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-xl">Join the TradePeaks waitlist</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm text-blue-100/70">
                    We’re polishing onboarding. Drop your email and you’ll be first in when it opens.
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
                        className="bg-black/30 border-blue-500/20 text-blue-50 placeholder:text-blue-100/40"
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
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10">
        {/* HERO */}
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-7 text-center md:text-left">
                <h1
                  className="text-6xl md:text-7xl font-light italic"
                  style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.08em",
                    filter: "drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))",
                  }}
                >
                  TradePeaks
                </h1>

                <h2 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                  Track Your Trades. Find Your Edge. Climb Faster.
                </h2>

                <p className="mt-5 text-lg text-blue-100/80 max-w-xl mx-auto md:mx-0">
                  A performance-first trading journal for momentum and scalp traders — tag setups, spot rule breaks, and
                  see exactly where your results peak.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
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

              <div className="md:col-span-5">
                <Card className="relative overflow-hidden border border-blue-500/20 bg-black/35 backdrop-blur-xl shadow-[0_0_60px_rgba(59,130,246,0.18)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-blue-100/60">Today’s Score</p>
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

        {/* Feature cards row */}
        <section className="container mx-auto px-4 pb-14">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Trophy className="h-5 w-5 text-blue-200" />,
                title: "Climb Higher",
                desc: "Every trade is a step. Track progress and improve faster.",
              },
              {
                icon: <Target className="h-5 w-5 text-cyan-200" />,
                title: "The Summit Awaits",
                desc: "Define your edge and map the journey to consistency.",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-sky-200" />,
                title: "Read the Terrain",
                desc: "See where your results peak: time windows, setups, habits.",
              },
            ].map((c) => (
              <Card key={c.title} className="border border-blue-500/15 bg-black/25 backdrop-blur-xl p-6">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                  {c.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-50">{c.title}</h3>
                <p className="mt-2 text-sm text-blue-100/70">{c.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Why TradePeaks */}
        <section className="container mx-auto px-4 py-14">
          <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <h3 className="text-2xl font-semibold text-blue-50">Why TradePeaks</h3>
              <p className="mt-3 text-blue-100/70">
                Performance that’s actually tradable: setups, timing windows, rule breaks, and daily review. You don’t
                just log trades — you find the patterns that move your P&L.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { icon: <LineChart className="h-4 w-4" />, text: "Setup-based stats (what actually works)" },
                  { icon: <Clock className="h-4 w-4" />, text: "Peak windows (when you trade best)" },
                  { icon: <ShieldAlert className="h-4 w-4" />, text: "Rule-break tracking + discipline flags" },
                  { icon: <Zap className="h-4 w-4" />, text: "Daily review slides (process → improvement)" },
                ].map((i) => (
                  <div key={i.text} className="flex items-center gap-3 text-sm text-blue-100/75">
                    <span className="text-cyan-200/80">{i.icon}</span>
                    <span>{i.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30"
                  onClick={() => setWaitlistOpen(true)}
                >
                  Join Waitlist
                </Button>
              </div>
            </div>

            <div className="md:col-span-7">
              {/* Placeholder “dashboard preview” card */}
              <Card className="border border-blue-500/15 bg-black/25 backdrop-blur-xl p-6">
                <div className="text-xs uppercase tracking-widest text-blue-100/55">Dashboard Preview</div>
                <div className="mt-3 h-[260px] rounded-xl border border-blue-500/10 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 flex items-center justify-center">
                  <span className="text-sm text-blue-100/55">Drop in your dashboard screenshot here later</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* System steps */}
        <section className="container mx-auto px-4 py-14">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-center text-2xl font-semibold text-blue-50">The TradePeaks System</h3>
            <p className="mt-2 text-center text-blue-100/70">Import → Tag → Improve. Every day.</p>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                { n: "1", title: "Import", desc: "CSV or manual — get trades in fast." },
                { n: "2", title: "Tag", desc: "Setup, session, timeframe, notes, rule breaks." },
                { n: "3", title: "Improve", desc: "Review, spot patterns, build consistency." },
              ].map((s) => (
                <Card key={s.n} className="border border-blue-500/15 bg-black/25 backdrop-blur-xl p-6">
                  <div className="text-sm text-blue-100/60">Step {s.n}</div>
                  <div className="mt-2 text-lg font-semibold text-blue-50">{s.title}</div>
                  <div className="mt-2 text-sm text-blue-100/70">{s.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border border-blue-500/20 bg-black/30 backdrop-blur-xl p-10">
              <Zap className="h-10 w-10 text-cyan-200 mx-auto" />
              <h3 className="mt-4 text-2xl font-semibold text-blue-50">But why?</h3>
              <p className="mt-3 text-blue-100/70">
                While others stay in the feeding grounds, some traders are drawn to the mountains. Get early access to
                TradePeaks.
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

        <footer className="border-t border-blue-500/10 bg-black/15 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-10 text-center text-blue-200/50 text-sm">
            © {new Date().getFullYear()} TradePeaks. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
