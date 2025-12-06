import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";
import { useMemo } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Generate particles with random properties
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="min-h-screen lucid-bg relative overflow-hidden">
      {/* Dreamy lucid background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary ethereal orbs - deep blue illumination against darkness */}
        <div className="lucid-orb absolute -top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/50 via-blue-600/40 to-transparent rounded-full blur-3xl shadow-[0_0_200px_rgba(59,130,246,0.4)]" />
        <div className="lucid-orb-slow absolute top-1/3 -right-20 w-[700px] h-[700px] bg-gradient-to-bl from-cyan-400/45 via-blue-500/35 to-transparent rounded-full blur-3xl shadow-[0_0_200px_rgba(34,211,238,0.3)]" style={{ animationDelay: '2s' }} />
        <div className="lucid-orb absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/45 via-blue-400/35 to-transparent rounded-full blur-3xl shadow-[0_0_200px_rgba(99,102,241,0.4)]" style={{ animationDelay: '4s' }} />
        <div className="lucid-orb-slow absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-sky-400/40 via-blue-500/30 to-transparent rounded-full blur-3xl shadow-[0_0_180px_rgba(14,165,233,0.35)]" style={{ animationDelay: '6s' }} />
        <div className="lucid-orb absolute top-2/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/35 via-cyan-500/25 to-transparent rounded-full blur-3xl shadow-[0_0_150px_rgba(96,165,250,0.3)]" style={{ animationDelay: '3s' }} />
        
        {/* Moving particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
        
      </div>
      
      <header className="border-b border-blue-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradeLucid" className="h-10 w-10" />
            <span className="text-xl font-bold"></span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" className="text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30" onClick={() => navigate("/auth")}>
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
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(59, 130, 246, 0.6), 0 0 120px rgba(34, 211, 238, 0.3)',
                letterSpacing: '0.08em',
                fontWeight: 300,
                filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))'
              }}>TradeLucid</h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent animate-fade-in">
              Your Gamified, Dream-Driven Path to Trading Excellence
            </h2>
            <p className="text-xl text-blue-100/80 mb-8 animate-fade-in">
              Transform your trading journey with Lucid. Track every trade, build your dreams, and level up your
              skills with our gamified trading journal.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-blue-400/30 text-blue-200 hover:bg-blue-500/10 hover:border-blue-400/50">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-blue-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:border-blue-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Gamified Progress</h3>
              <p className="text-blue-100/70">
                Earn achievements, level up, and track your trading milestones with our gamification system.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-cyan-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:border-cyan-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                <Target className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Dream Builder</h3>
              <p className="text-cyan-100/70">
                Define your trading dreams, set milestones, and visualize your path to success.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-sky-500/20 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(14,165,233,0.25)] hover:border-sky-400/40 transition-all group">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 mb-4 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all">
                <TrendingUp className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Advanced Analytics</h3>
              <p className="text-sky-100/70">
                Deep insights into your trading patterns, win rates, and performance metrics.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl border border-blue-500/30 bg-blue-950/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10"></div>
            <div className="relative">
              <Zap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Transform Your Trading?</h2>
              <p className="text-xl text-blue-100/80 mb-8">
                Join Lucid today and start your journey to becoming a consistently profitable trader.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30" onClick={() => navigate("/auth")}>
                Start Free Trial Today
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-500/30 bg-black/40 backdrop-blur-sm mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center text-blue-200/60">
          <p>© 2025 TradeLucid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
export default Index;
