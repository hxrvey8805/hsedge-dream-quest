import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, ClipboardCheck, Gauge, Mountain, Volume2, VolumeX } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import heroBanner from "@/assets/landing/background/hero-banner.png";
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
  const [isMuted, setIsMuted] = useState(false);
  const [entered, setEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnter = () => {
    const audio = new Audio("/audio/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});
    setEntered(true);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      const next = !isMuted;
      audioRef.current.muted = next;
      setIsMuted(next);
    }
  };

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

  if (!entered) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#030712] flex flex-col items-center justify-center cursor-pointer" onClick={handleEnter}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            style={{ color: 'hsl(212 98% 62%)', textShadow: '0 0 30px hsl(212 98% 62% / 0.4), 0 0 60px hsl(212 98% 62% / 0.15)' }}
          >
            TRADE PEAKS
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/60 text-lg font-medium tracking-widest uppercase"
          >
            Click anywhere to enter
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Sound toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-5 right-5 z-[60] p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 py-5 flex items-center justify-center gap-10">
          <nav className="flex items-center gap-8">
            <a href="#system" className="text-base text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">System</a>
            <a href="#analytics" className="text-base text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Analytics</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-base text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Pricing</button>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-base text-white/60 hover:text-white transition-colors duration-300 font-medium tracking-wide">Playbooks</button>
          </nav>
          <Button size="default" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full px-6 py-2.5 text-base font-medium transition-all duration-300 hover:border-white/40" onClick={() => navigate("/auth")}>
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

        {/* Hero Content */}
        <section className="relative w-full py-20 lg:py-32 bg-[hsl(var(--background))]">
          <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Massive single-line headline */}
              <h1
                className="font-black mb-16 leading-[1.08] tracking-tight text-center mx-auto"
                style={{ color: 'hsl(212 98% 62%)', textShadow: '0 0 30px hsl(212 98% 62% / 0.4), 0 0 60px hsl(212 98% 62% / 0.15)', fontSize: 'clamp(2rem, 6.5vw, 8rem)' }}
              >
                WELCOME TO TRADE PEAKS
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Left column */}
                <div>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-8 leading-tight tracking-tight">
                    Define your summit.{" "}
                    <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Trade with direction.</span>
                  </p>

                  <div className="space-y-5 mb-10">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Most traders don't fail because they lack data.
                      <br />
                      <span className="text-foreground font-semibold">They fail because they lack focus.</span>
                    </p>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      TradePeaks is a structured daily performance system designed to help you identify what truly matters, improve it deliberately, and see your progress over time.
                    </p>
                    <p className="text-primary text-base font-semibold">
                      This is where traders stop reacting — and start climbing.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
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
                </div>

                {/* Right column – proof cards */}
                <div className="flex flex-col gap-4">
                  {proofCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      >
                        <Card className="bg-card/30 border-border/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 group">
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground mb-1">{card.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Showcase (all remaining sections) */}
        <FeatureShowcase onStartClimbing={openWaitlist} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712]">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 text-center text-white/30 py-8 text-sm">
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
