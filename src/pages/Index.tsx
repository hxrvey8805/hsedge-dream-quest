import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";
import { useMemo } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Generate deep blue illuminated floating particles
  const lucidParticles = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${20 + Math.random() * 25}s`,
      size: Math.random() * 5 + 3,
      opacity: 0.5 + Math.random() * 0.5,
      driftX: Math.random() * 150 - 75, // Random horizontal drift
      driftY: Math.random() * 100 + 50, // Random vertical movement
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#070C1A] relative overflow-hidden">
      {/* Radial gradient overlay background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              80rem 40rem at 50% -10%,
              rgba(16, 40, 90, 0.55),
              transparent 60%
            ),
            radial-gradient(
              60rem 30rem at 50% 120%,
              rgba(7, 12, 26, 0.8),
              transparent 60%
            )
          `
        }}
      />
      {/* Dreamy lucid background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary ethereal orbs - enhanced deep blue illumination */}
        <div className="lucid-orb absolute -top-20 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-blue-500/60 via-blue-600/50 via-cyan-500/40 to-transparent rounded-full blur-3xl" style={{ boxShadow: '0 0 250px rgba(59,130,246,0.5), 0 0 400px rgba(59,130,246,0.3), 0 0 600px rgba(59,130,246,0.15)' }} />
        <div className="lucid-orb-slow absolute top-1/3 -right-20 w-[750px] h-[750px] bg-gradient-to-bl from-cyan-400/55 via-blue-500/45 via-sky-400/35 to-transparent rounded-full blur-3xl" style={{ animationDelay: '2s', boxShadow: '0 0 250px rgba(34,211,238,0.45), 0 0 400px rgba(34,211,238,0.25), 0 0 550px rgba(34,211,238,0.15)' }} />
        <div className="lucid-orb absolute bottom-0 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/55 via-blue-400/45 via-violet-400/35 to-transparent rounded-full blur-3xl" style={{ animationDelay: '4s', boxShadow: '0 0 250px rgba(99,102,241,0.5), 0 0 400px rgba(99,102,241,0.3), 0 0 550px rgba(99,102,241,0.15)' }} />
        <div className="lucid-orb-slow absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-sky-400/50 via-blue-500/40 via-cyan-400/30 to-transparent rounded-full blur-3xl" style={{ animationDelay: '6s', boxShadow: '0 0 220px rgba(14,165,233,0.45), 0 0 350px rgba(14,165,233,0.25), 0 0 500px rgba(14,165,233,0.15)' }} />
        <div className="lucid-orb absolute top-2/3 left-1/2 w-[450px] h-[450px] bg-gradient-to-br from-blue-400/45 via-cyan-500/35 via-blue-300/25 to-transparent rounded-full blur-3xl" style={{ animationDelay: '3s', boxShadow: '0 0 200px rgba(96,165,250,0.45), 0 0 320px rgba(96,165,250,0.25), 0 0 450px rgba(96,165,250,0.15)' }} />
        
        {/* Secondary subtle glow layers for depth */}
        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(59, 130, 246, 0.05) 100%)' }} />
        
        {/* Deep blue illuminated floating particles */}
        {lucidParticles.map((particle) => (
          <div
            key={particle.id}
            className="lucid-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: `${particle.duration}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              '--drift-x': `${particle.driftX}px`,
              '--drift-y': `${particle.driftY}px`,
            } as React.CSSProperties}
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
