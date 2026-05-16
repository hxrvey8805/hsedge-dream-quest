import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, ClipboardCheck, Gauge, Mountain, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import heroBanner from "@/assets/landing/background/hero-banner.png";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";

const proofCards = [
  { icon: ClipboardCheck, title: "Daily Report Card", desc: "Structured reflection that forces growth every session." },
  { icon: Gauge, title: "Edge Clarity", desc: "Know which setups, sessions, and habits drive your P&L." },
  { icon: Mountain, title: "Dream Builder", desc: "Connect daily execution to the life you're trading for." },
];

export default function Index() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const sendWaitlistWelcome = async (email: string, firstName?: string) => {
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "waitlist-welcome",
          recipientEmail: email,
          idempotencyKey: `waitlist-welcome-${email.toLowerCase()}`,
          ...(firstName ? { templateData: { firstName } } : {}),
        },
      });
    } catch (err) {
      // Non-blocking — signup already succeeded
      console.error("Welcome email failed to enqueue:", err);
    }
  };
  const [isMuted, setIsMuted] = useState(false);
  const [entered, setEntered] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("tp-entered") === "1");
  const { theme, setTheme } = useTheme();
  const lightMode = theme === "light";
  const setLightMode = (v: boolean) => setTheme(v ? "light" : "dark");
  const [entryValue, setEntryValue] = useState("");
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Approximate hero image height; switch when scrolled past most of viewport
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ACCESS_PASSWORD = "summit2026";

  const handleEnter = () => {
    const audio = new Audio("/audio/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});
    sessionStorage.setItem("tp-entered", "1");
    setEntered(true);
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = entryValue.trim();
    if (!v) return;
    if (v === ACCESS_PASSWORD) {
      handleEnter();
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      setEntrySubmitting(true);
      const { error } = await (supabase.from("waitlist_signups" as any) as any).insert({ email: v, source: "landing" });
      if (error) {
        const code = (error as any)?.code;
        const msg = (error as any)?.message?.toLowerCase?.() || "";
        if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
          toast.success("You're already on the list — we'll alert you when TradePeaks is available.");
          setEntryValue("");
          return;
        }
        console.error(error);
        toast.error("Couldn't join the waitlist — try again.");
        return;
      }
      toast.success("You're on the list! We'll alert you when TradePeaks is available.");
      setEntryValue("");
      sendWaitlistWelcome(v);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't join the waitlist — try again.");
    } finally {
      setEntrySubmitting(false);
    }
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
    if (!audioRef.current) {
      const audio = new Audio("/audio/ambient.mp3");
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
      audio.play().catch(() => {});
      setIsMuted(false);
      return;
    }
    const next = !isMuted;
    audioRef.current.muted = next;
    if (!next && audioRef.current.paused) audioRef.current.play().catch(() => {});
    setIsMuted(next);
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
    const firstName = waitlistName.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      setWaitlistLoading(true);
      const { error } = await (supabase.from("waitlist_signups" as any) as any).insert({
        email,
        source: "landing",
        ...(firstName ? { first_name: firstName } : {}),
      });
      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || "";
        const code = (error as any)?.code;
        if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
          toast.success("You're already on the waitlist.");
          setWaitlistOpen(false);
          setWaitlistEmail("");
          setWaitlistName("");
          return;
        }
        console.error(error);
        toast.error("Couldn't join the waitlist — try again.");
        return;
      }
      toast.success("You're on the TradePeaks waitlist. Check your inbox!");
      setWaitlistOpen(false);
      setWaitlistEmail("");
      setWaitlistName("");
      sendWaitlistWelcome(email, firstName || undefined);
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
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{
          backgroundColor: '#070C1A',
          backgroundImage: `
            radial-gradient(80rem 40rem at 50% -10%, rgba(16, 40, 90, 0.55), transparent 60%),
            radial-gradient(60rem 30rem at 50% 120%, rgba(7, 12, 26, 0.8), transparent 60%)
          `,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center w-full px-6"
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            style={{ color: 'hsl(212 98% 62%)', textShadow: '0 0 30px hsl(212 98% 62% / 0.4), 0 0 60px hsl(212 98% 62% / 0.15)' }}
          >
            TRADE PEAKS
          </h1>
          <motion.form
            onSubmit={handleEntrySubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto max-w-md"
          >
            <input
              type="text"
              value={entryValue}
              onChange={(e) => setEntryValue(e.target.value)}
              placeholder="Enter email to join waitlist"
              disabled={entrySubmitting}
              className="w-full bg-transparent border-0 outline-none text-center text-white text-lg font-medium tracking-widest uppercase placeholder:text-white/50 py-3 caret-transparent focus:caret-[hsl(212_98%_62%)]"
            />
          </motion.form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen overflow-x-hidden transition-colors duration-500 ${lightMode ? 'landing-light' : ''}`} style={{ backgroundColor: lightMode ? '#f8fafc' : '#030712' }}>
      {/* Controls: Light mode + Sound toggle */}
      <div className="fixed top-5 right-5 z-[60] flex items-center gap-2">
        <button
          onClick={() => setLightMode(!lightMode)}
          className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
            lightMode
              ? 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white shadow-sm'
              : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20'
          }`}
          title={lightMode ? "Dark mode" : "Light mode"}
        >
          {lightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleMute}
          className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
            lightMode
              ? 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white shadow-sm'
              : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20'
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 py-5 flex items-center justify-center gap-10">
          <nav className="flex items-center gap-8 rounded-full px-6 py-2">
            <a href="#system" className="text-base transition-colors duration-300 font-medium tracking-wide text-white/80 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">System</a>
            <a href="#analytics" className="text-base transition-colors duration-300 font-medium tracking-wide text-white/80 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Analytics</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-base transition-colors duration-300 font-medium tracking-wide text-white/80 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Pricing</button>
            <button type="button" onClick={() => navigate("/playbooks")} className="text-base transition-colors duration-300 font-medium tracking-wide text-white/80 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Playbooks</button>
          </nav>
          <Button size="default" className={`backdrop-blur-md rounded-full px-6 py-2.5 text-base font-medium transition-all duration-300 ${lightMode ? 'bg-white/80 hover:bg-white text-gray-900 border border-gray-300 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'}`} onClick={() => navigate("/auth")}>
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
                        <div className="space-y-2">
                          <Input
                            placeholder="First name (optional)"
                            value={waitlistName}
                            onChange={(e) => setWaitlistName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitWaitlist()}
                          />
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
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>

                {/* Right column – proof cards */}
                <div className="flex flex-col gap-5">
                  {proofCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                      >
                        <Card className="relative overflow-hidden bg-card/40 border-border/30 backdrop-blur-md p-0 hover:border-primary/40 transition-all duration-500 group hover:shadow-[0_0_40px_hsl(212_98%_62%/0.15)]">
                          {/* Gradient accent bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent group-hover:w-1.5 transition-all duration-500" />
                          
                          <div className="flex items-start gap-5 p-7 pl-8">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(212_98%_62%/0.2)] transition-all duration-500">
                              <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{card.title}</h3>
                              <p className="text-base text-muted-foreground leading-relaxed">{card.desc}</p>
                            </div>
                          </div>
                          
                          {/* Subtle hover glow overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/[0.03] group-hover:via-primary/[0.02] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
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
      <footer className={`border-t transition-colors duration-500 ${lightMode ? 'border-gray-200 bg-[#f8fafc]' : 'border-white/5 bg-[#030712]'}`}>
        <div className={`mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16 text-center py-8 text-sm ${lightMode ? 'text-gray-400' : 'text-white/30'}`}>
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
