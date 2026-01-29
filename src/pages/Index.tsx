import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import { useMemo, useState, useEffect, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for magnetic particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate deep blue illuminated floating particles with base positions
  const lucidParticles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 25,
      size: Math.random() * 6 + 3,
      opacity: 0.5 + Math.random() * 0.5,
      driftX: Math.random() * 150 - 75,
      driftY: Math.random() * 100 + 50,
      magnetStrength: 0.15 + Math.random() * 0.2
    }));
  }, []);

  // Calculate magnetic offset for each particle
  const getParticleStyle = (particle: typeof lucidParticles[0]) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const particleX = (particle.baseX / 100) * rect.width;
    const particleY = (particle.baseY / 100) * rect.height;
    const dx = mousePos.x - particleX;
    const dy = mousePos.y - particleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxDistance = 350;
    const strength = Math.max(0, 1 - distance / maxDistance) * particle.magnetStrength;
    
    return {
      x: dx * strength * 0.5,
      y: dy * strength * 0.5
    };
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070C1A] relative overflow-hidden">
      {/* Glowing Moon - positioned BEHIND mountains with lower z-index */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 1 }}>
        {/* Outer glow rings */}
        <div 
          className="absolute w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 240, 200, 0.15) 0%, rgba(255, 220, 150, 0.05) 50%, transparent 70%)' }}
        />
        <div 
          className="absolute w-[220px] h-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 250, 230, 0.25) 0%, rgba(255, 230, 180, 0.1) 50%, transparent 70%)' }}
        />
        {/* Moon body */}
        <div 
          className="moon w-[140px] h-[140px] rounded-full relative -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #fff9e6 0%, #f5e6c8 30%, #e8d4a8 60%, #d4b896 100%)',
            boxShadow: '0 0 80px rgba(255, 245, 200, 0.6), 0 0 150px rgba(255, 220, 150, 0.4), inset -12px -12px 25px rgba(200, 170, 120, 0.3)'
          }}
        />
      </div>

      {/* Natural Mountain Silhouettes - positioned IN FRONT of moon */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <svg className="absolute bottom-0 left-0 w-full h-[65%]" viewBox="0 0 1200 450" preserveAspectRatio="none">
          <defs>
            <linearGradient id="distantMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.06)" />
              <stop offset="100%" stopColor="rgba(30, 64, 175, 0.08)" />
            </linearGradient>
            <linearGradient id="midMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(30, 64, 175, 0.12)" />
            </linearGradient>
            <linearGradient id="heroPeak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0.14)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0.16)" />
            </linearGradient>
            <linearGradient id="foregroundRidge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(30, 64, 175, 0.08)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0.12)" />
            </linearGradient>
          </defs>
          
          {/* Distant range - soft, natural curves */}
          <path d="M0,450 L0,300 Q75,260 150,280 Q225,240 300,270 Q400,220 500,250 Q600,200 700,230 Q800,190 900,220 Q1000,180 1100,210 L1200,190 L1200,450 Z" fill="url(#distantMountain)" />
          
          {/* Mid-layer - rolling natural hills */}
          <path d="M0,450 L0,340 Q100,300 200,320 Q320,270 450,300 Q550,250 650,280 Q750,230 850,260 Q950,220 1050,250 Q1150,230 1200,240 L1200,450 Z" fill="url(#midMountain)" />
          
          {/* Hero peak - prominent natural mountain with gentle slopes */}
          <path d="M300,450 Q400,380 480,280 Q530,200 600,140 Q670,200 720,280 Q800,380 900,450 Z" fill="url(#heroPeak)" />
          {/* Snow cap on hero peak */}
          <path d="M600,140 Q615,165 630,180 L600,175 L570,180 Q585,165 600,140 Z" fill="rgba(255, 255, 255, 0.1)" />
          
          {/* Foreground ridge - natural undulating terrain */}
          <path d="M0,450 L0,380 Q60,365 120,375 Q180,355 240,370 Q320,350 400,365 Q480,345 560,360 Q640,340 720,355 Q800,335 880,350 Q960,330 1040,345 Q1120,325 1200,340 L1200,450 Z" fill="url(#foregroundRidge)" />
        </svg>
      </div>

      {/* Radial gradient overlay background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3, background: `
        radial-gradient(80rem 40rem at 50% -10%, rgba(16, 40, 90, 0.55), transparent 60%),
        radial-gradient(60rem 30rem at 50% 120%, rgba(7, 12, 26, 0.8), transparent 60%)
      ` }} />

      {/* Floating particles container - original blue magnetic dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
        {lucidParticles.map(particle => {
          const magnetOffset = getParticleStyle(particle);
          return (
            <div
              key={particle.id}
              className="lucid-particle"
              style={{
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
              } as React.CSSProperties}
            />
          );
        })}
      </div>
      
      <header className="border-b border-blue-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-10 w-10" />
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
              }}>TradePeaks</h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent animate-fade-in">Your Dream-Driven Path to Trading Excellence</h2>
            <p className="text-xl text-blue-100/80 mb-8 animate-fade-in italic font-light">Transform your trading journey with TP. Track every trade, build your dreams, and reach the summit with our trading journal.</p>
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
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/30" onClick={() => navigate("/auth")}>
                Start Free Trial Today
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
