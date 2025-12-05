import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen lucid-bg relative overflow-hidden">
      {/* Dreamy lucid background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary ethereal orbs */}
        <div className="lucid-orb absolute -top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/25 via-purple-400/15 to-transparent rounded-full blur-3xl" />
        <div className="lucid-orb-slow absolute top-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-400/20 via-blue-500/15 to-transparent rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="lucid-orb absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-fuchsia-500/20 via-pink-400/10 to-transparent rounded-full blur-3xl" style={{ animationDelay: '4s' }} />
        
        {/* Secondary floating particles */}
        <div className="lucid-orb-drift absolute top-1/2 left-1/3 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl" />
        <div className="lucid-orb-drift absolute top-1/4 right-1/3 w-24 h-24 bg-cyan-300/15 rounded-full blur-xl" style={{ animationDelay: '5s' }} />
        <div className="lucid-orb-drift absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" style={{ animationDelay: '10s' }} />
        
        {/* Subtle grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>
      
      <header className="border-b border-violet-500/20 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradeLucid" className="h-10 w-10" />
            <span className="text-xl font-bold"></span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="text-violet-200/80 hover:text-violet-100 hover:bg-violet-500/10" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" className="text-violet-200/80 hover:text-violet-100 hover:bg-violet-500/10" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 border-0 shadow-lg shadow-violet-500/25" onClick={() => navigate("/auth")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-7xl md:text-8xl font-light italic" style={{
                fontFamily: "'Playfair Display', 'Dancing Script', 'Georgia', serif",
                background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 40%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(192, 132, 252, 0.5), 0 0 120px rgba(34, 211, 238, 0.3)',
                letterSpacing: '0.08em',
                fontWeight: 300,
                filter: 'drop-shadow(0 0 40px rgba(192, 132, 252, 0.4))'
              }}>TradeLucid</h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent animate-fade-in">
              Your Gamified, Dream-Driven Path to Trading Excellence
            </h2>
            <p className="text-xl text-violet-100/80 mb-8 animate-fade-in">
              Transform your trading journey with Lucid. Track every trade, build your dreams, and level up your
              skills with our gamified trading journal.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 border-0 shadow-lg shadow-violet-500/25" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-violet-400/30 text-violet-200 hover:bg-violet-500/10 hover:border-violet-400/50">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-violet-500/20 bg-slate-900/50 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(192,132,252,0.2)] hover:border-violet-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all">
                <Trophy className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Gamified Progress</h3>
              <p className="text-violet-100/70">
                Earn achievements, level up, and track your trading milestones with our gamification system.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:border-cyan-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                <Target className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Dream Builder</h3>
              <p className="text-cyan-100/70">
                Define your trading dreams, set milestones, and visualize your path to success.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-fuchsia-500/20 bg-slate-900/50 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(217,70,239,0.2)] hover:border-fuchsia-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-fuchsia-500/20 transition-all">
                <TrendingUp className="h-8 w-8 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Advanced Analytics</h3>
              <p className="text-fuchsia-100/70">
                Deep insights into your trading patterns, win rates, and performance metrics.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl border border-violet-500/30 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10"></div>
            <div className="relative">
              <Zap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Transform Your Trading?</h2>
              <p className="text-xl text-violet-100/80 mb-8">
                Join Lucid today and start your journey to becoming a consistently profitable trader.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 border-0 shadow-lg shadow-violet-500/25" onClick={() => navigate("/auth")}>
                Start Free Trial Today
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-violet-500/20 bg-slate-950/60 backdrop-blur-sm mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center text-violet-200/60">
          <p>© 2025 TradeLucid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
export default Index;