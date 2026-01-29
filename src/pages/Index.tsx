import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LayoutDashboard, Mail } from "lucide-react";
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
    <div className="relative w-full">
      {/* Header - fixed, transparent */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="TradePeaks" className="h-7 w-7" />
          </div>

          <nav className="flex items-center gap-4">
            <a href="#features" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Features</a>
            <a href="#analysis" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Analysis</a>
            <a href="#why" className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">Why TradePeaks</a>
            <button type="button" onClick={() => navigate("/pricing")} className="text-xs text-blue-100/80 hover:text-white transition whitespace-nowrap">
              Pricing
            </button>

            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600/25 text-blue-100 hover:bg-blue-600/35 border border-blue-400/25 shadow-lg shadow-blue-500/20 text-xs px-3 py-1 h-7">
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
          </nav>
        </div>
      </header>

      {/* Background images stacked vertically */}
      <div className="w-full">
        {/* Background 1 - Hero with TP logo, moon, mountains, headline */}
        <div className="relative w-full">
          <img src={bg1} alt="" className="w-full h-auto" />
          
          {/* Interactive overlay for hero section - buttons positioned over the image */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-[8%]">
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
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

            {/* Today's Score Card */}
            <Card className="mt-6 mx-4 max-w-sm bg-black/55 backdrop-blur-xl border border-blue-500/25 shadow-[0_0_40px_rgba(59,130,246,0.12)] overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-100/60">Today's Score</p>
                    <p className="text-xl font-semibold text-white">
                      8.2 <span className="text-sm text-blue-100/60">/ 10</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600/50 to-cyan-400/40 border border-blue-500/25" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-black/40 px-2.5 py-2">
                    <span className="text-xs text-blue-100/80">Wins / Losses</span>
                    <span className="text-xs font-medium text-white">8.2/10</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-black/40 px-2.5 py-2">
                    <span className="text-xs text-blue-100/80">Mindset</span>
                    <span className="text-xs font-medium text-white">Neutral</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-black/40 px-2.5 py-2">
                    <span className="text-xs text-blue-100/80">First 30 Minutes</span>
                    <span className="text-xs font-medium text-white">On track</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-black/40 px-2.5 py-2">
                    <span className="text-xs text-blue-100/80">Risk/Reward Ratio Check</span>
                    <span className="text-xs font-medium text-white">✓</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Background 2 - Mid section */}
        <img src={bg2} alt="" className="w-full h-auto" id="features" />

        {/* Background 3 - Bottom section */}
        <img src={bg3} alt="" className="w-full h-auto" id="why" />
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
