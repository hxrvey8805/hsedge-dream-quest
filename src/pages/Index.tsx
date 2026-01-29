import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import bg1 from "@/assets/landing/background/background1.png";
import bg2 from "@/assets/landing/background/background2.png";
import bg3 from "@/assets/landing/background/background3.png";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

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
    <div className="relative w-full bg-[#050A14] overflow-x-hidden">
      {/* Header - fixed, transparent, centered */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-8">
          <img src={logo} alt="TradePeaks" className="h-6 w-6" />
          
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Features</a>
            <a href="#analytics" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Analytics</a>
            <a href="#playbooks" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Playbooks</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">
              Pricing
            </button>
          </nav>

          <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30 text-xs px-4 py-1 h-7 rounded-full">
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

      {/* Background images as CSS backgrounds - zoomed out */}
      <div className="w-full">
        {/* Section 1 - Background 1 (TP logo, moon, mountains) - NO TEXT */}
        <div 
          className="relative w-full min-h-[50vw]"
          style={{
            backgroundImage: `url(${bg1})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Section 2 - Background 2 - Hero text content */}
        <div 
          className="relative w-full min-h-[50vw]"
          id="features"
          style={{
            backgroundImage: `url(${bg2})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Hero content - moved from section 1 */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left side - Text content */}
                <div className="lg:col-span-7 text-center lg:text-left">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    Track Your Trades. Find Your Edge.
                    <br />
                    <span className="text-white">Climb Faster.</span>
                  </h1>
                  
                  <p className="mt-3 text-sm text-blue-100/70 max-w-lg mx-auto lg:mx-0">
                    A trading journal built for momentum and scalp traders—imports your executions, 
                    grades your process, and shows you exactly where your performance peaks.
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30 px-6"
                      onClick={() => setWaitlistOpen(true)}
                    >
                      Start Free
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6"
                      onClick={() => navigate("/dashboard")}
                    >
                      View Dashboard
                    </Button>
                  </div>

                  {/* Feature highlights */}
                  <div className="mt-5 flex flex-wrap gap-3 justify-center lg:justify-start text-xs text-blue-100/50">
                    <span>Auto-imports executions</span>
                    <span>·</span>
                    <span>Setup tagging + playbooks</span>
                    <span>·</span>
                    <span>Stats that actually matter</span>
                  </div>
                </div>

                {/* Right side - Today's Score Card */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <Card className="w-full max-w-xs bg-black/40 backdrop-blur-xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-widest text-blue-100/50 mb-3">Today's Score</p>
                      
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span className="text-xs text-blue-100/70">Discipline</span>
                          </div>
                          <span className="text-xs font-medium text-white">8.2 / 10</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span className="text-xs text-blue-100/70">Best Setup</span>
                          </div>
                          <span className="text-xs font-medium text-white">Pullback</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span className="text-xs text-blue-100/70">Peak Window</span>
                          </div>
                          <span className="text-xs font-medium text-white">14:32 – 14:51</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span className="text-xs text-blue-100/70">Mistake Flag</span>
                          </div>
                          <span className="text-xs font-medium text-white">Chased extension</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 - Background 3 - Why TradePeaks content (moved from section 2) */}
        <div 
          className="relative w-full min-h-[50vw]"
          id="analytics"
          style={{
            backgroundImage: `url(${bg3})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Why TradePeaks content - moved from section 2 */}
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="container mx-auto px-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white text-center mb-6">
                Why TradePeaks
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                {/* Left - Feature list */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3">
                    Performance that's<br />actually tradable
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      "Expectancy by setup (R-based)",
                      "Win rate by time window",
                      "Best tickers + catalysts",
                      "Heatmaps: time + setup + volatility",
                      "Rule breaks & 'tilt' moments"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-blue-100/80">
                        <span className="text-cyan-400">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="mt-5 bg-transparent border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-5"
                    onClick={() => navigate("/dashboard")}
                  >
                    See a Live Example
                  </Button>
                </div>

                {/* Right - Dashboard preview placeholder */}
                <div className="hidden lg:block">
                  {/* Dashboard preview is part of bg3 image */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-500/15 bg-[#050A14]">
        <div className="container mx-auto px-4 py-10 text-center text-blue-200/50 text-sm">
          © {new Date().getFullYear()} TradePeaks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
