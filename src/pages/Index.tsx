import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { TPLogo } from "@/components/TPLogo";
import { useMemo, useState, useEffect, useRef } from "react";
const Index = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate deep blue illuminated floating particles with base positions
  const lucidParticles = useMemo(() => {
    return Array.from({
      length: 40
    }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 25,
      size: Math.random() * 6 + 3,
      opacity: 0.5 + Math.random() * 0.5,
      driftX: Math.random() * 150 - 75,
      driftY: Math.random() * 100 + 50,
      magnetStrength: 0.15 + Math.random() * 0.2 // How strongly attracted to mouse
    }));
  }, []);

  // Calculate magnetic offset for each particle
  const getParticleStyle = (particle: typeof lucidParticles[0]) => {
    if (!containerRef.current) return {
      x: 0,
      y: 0
    };
    const rect = containerRef.current.getBoundingClientRect();
    const particleX = particle.baseX / 100 * rect.width;
    const particleY = particle.baseY / 100 * rect.height;
    const dx = mousePos.x - particleX;
    const dy = mousePos.y - particleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Magnetic effect with falloff (stronger when closer, max range ~300px)
    const maxDistance = 350;
    const strength = Math.max(0, 1 - distance / maxDistance) * particle.magnetStrength;
    return {
      x: dx * strength * 0.5,
      y: dy * strength * 0.5
    };
  };
  return (
    <div ref={containerRef} className="min-h-screen bg-[#070C1A] relative overflow-hidden">
      {/* Dreamlike mountain peaks background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Glow filters for surreal effect */}
            <filter id="mountainGlow1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 1 0 0  0 0.5 1 0 0  0 1 1 0 0  0 0 0 0.4 0" />
            </filter>
            <filter id="mountainGlow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0.2 0.4 1 0 0  0.3 0.6 1 0 0  0.4 0.8 1 0 0  0 0 0 0.3 0" />
            </filter>
            <filter id="mountainGlow3" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0.3 0.5 1 0 0  0.4 0.7 1 0 0  0.5 0.9 1 0 0  0 0 0 0.35 0" />
            </filter>
            {/* Gradient for ethereal peaks */}
            <linearGradient id="peakGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0.5)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.2)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="peakGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.5)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.15)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="peakGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.4)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.15)" stopOpacity="0.15" />
            </linearGradient>
            {/* Snow glow */}
            <radialGradient id="snowGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>
          
          {/* Back layer mountains - most distant, most blurred */}
          <path
            d="M0,600 L0,420 Q100,380 250,400 T500,380 T750,400 T1000,390 T1200,400 L1200,600 Z"
            fill="url(#peakGradient1)"
            filter="url(#mountainGlow2)"
            opacity="0.4"
          />
          {/* Middle layer mountains */}
          <path
            d="M0,600 L0,460 Q150,420 350,440 T700,420 T1050,450 T1200,440 L1200,600 Z"
            fill="url(#peakGradient2)"
            filter="url(#mountainGlow1)"
            opacity="0.5"
          />
          {/* Front layer mountains */}
          <path
            d="M0,600 L0,520 Q80,480 220,500 T480,480 T720,500 T980,490 T1200,510 L1200,600 Z"
            fill="url(#peakGradient3)"
            filter="url(#mountainGlow3)"
            opacity="0.6"
          />
          
          {/* Ethereal snow peaks with glow */}
          <g opacity="0.7">
            <circle cx="250" cy="380" r="25" fill="url(#snowGlow)" />
            <circle cx="650" cy="360" r="30" fill="url(#snowGlow)" />
            <circle cx="950" cy="390" r="28" fill="url(#snowGlow)" />
            <circle cx="450" cy="400" r="20" fill="url(#snowGlow)" />
            <circle cx="850" cy="420" r="22" fill="url(#snowGlow)" />
          </g>
          
          {/* Floating mist/clouds for surreal effect */}
          <ellipse cx="200" cy="500" rx="120" ry="40" fill="rgba(59, 130, 246, 0.15)" filter="url(#mountainGlow1)" opacity="0.6" />
          <ellipse cx="600" cy="480" rx="150" ry="50" fill="rgba(34, 211, 238, 0.12)" filter="url(#mountainGlow2)" opacity="0.5" />
          <ellipse cx="1000" cy="490" rx="130" ry="45" fill="rgba(96, 165, 250, 0.15)" filter="url(#mountainGlow1)" opacity="0.6" />
        </svg>
      </div>
      {/* Radial gradient overlay background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
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
    }} />
      {/* Floating particles container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Deep blue illuminated floating particles with magnetic effect */}
        {lucidParticles.map(particle => {
        const magnetOffset = getParticleStyle(particle);
        return <div key={particle.id} className="lucid-particle" style={{
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
        } as React.CSSProperties} />;
      })}
      </div>
      
      <header className="border-b border-blue-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TPLogo size={40} variant="icon" />
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
            <p className="text-xl text-blue-100/80 mb-8 animate-fade-in italic font-light">
              he would neither join the feeding grounds nor return to the colony. shortly afterwards he was heading straight to the peaks. but why
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
              <p className="text-xl text-blue-100/80 mb-8 italic font-light">While others stay in the valleys, some traders are drawn to the mountains. Find out what waits at the summit.</p>
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
    </div>;
};
export default Index;