import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/tp-logo.png";
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
  return <div ref={containerRef} className="min-h-screen bg-[#070C1A] relative overflow-hidden">
      {/* Twin Peaks inspired mountain background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Atmospheric glow behind mountains */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[70%]"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 50% 100%, 
                rgba(30, 58, 138, 0.4) 0%, 
                rgba(15, 23, 42, 0.2) 50%, 
                transparent 80%
              )
            `
          }}
        />
        
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMax slice">
          <defs>
            {/* Gradient for distant misty mountains */}
            <linearGradient id="mistGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(71, 85, 150, 0.3)" />
              <stop offset="100%" stopColor="rgba(30, 41, 82, 0.5)" />
            </linearGradient>
            
            {/* Gradient for mid-layer peaks */}
            <linearGradient id="midPeakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="60%" stopColor="rgba(30, 64, 120, 0.4)" />
              <stop offset="100%" stopColor="rgba(15, 30, 60, 0.6)" />
            </linearGradient>
            
            {/* Gradient for foreground silhouettes */}
            <linearGradient id="foregroundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(20, 40, 80, 0.7)" />
              <stop offset="100%" stopColor="rgba(7, 12, 26, 0.95)" />
            </linearGradient>
            
            {/* Mist overlay gradient */}
            <linearGradient id="mistOverlay" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(100, 150, 200, 0.15)" />
              <stop offset="40%" stopColor="rgba(80, 120, 180, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Glow filter for peaks */}
            <filter id="peakGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Layer 1: Distant misty mountain range - ethereal and faded */}
          <path 
            d="M-100,800 L-100,520 
               L80,480 L180,380 L280,450 L350,320 L420,400 L500,350 L580,420
               L680,280 L780,380 L850,300 L950,360 L1050,250 L1150,340 
               L1250,280 L1350,350 L1450,260 L1550,320 L1650,380 L1750,300
               L1850,360 L1950,400 L2020,350 L2020,800 Z" 
            fill="url(#mistGradient)"
            opacity="0.5"
          />
          
          {/* Layer 2: Mid-range dramatic peaks - Twin Peaks iconic silhouette */}
          <path 
            d="M-100,800 L-100,580 
               L50,550 L150,450 L220,500 L300,380 L380,450 L450,350 
               L550,420 L650,300 L720,380 L800,280 L900,350 L1000,240 
               L1100,320 L1180,260 L1280,340 L1380,220 L1500,300 
               L1600,250 L1700,340 L1800,280 L1900,350 L2020,400 L2020,800 Z" 
            fill="url(#midPeakGradient)"
            filter="url(#peakGlow)"
          />
          
          {/* Subtle peak highlights */}
          <path 
            d="M800,280 L850,260 L900,350 M1000,240 L1050,220 L1100,320 M1380,220 L1430,195 L1500,300" 
            fill="none"
            stroke="rgba(147, 197, 253, 0.2)"
            strokeWidth="2"
          />
          
          {/* Layer 3: Pine tree silhouettes on ridgeline */}
          <g opacity="0.6">
            {/* Left ridge trees */}
            <path d="M200,500 l-15,0 l15,-35 l15,35 z M220,500 l-10,0 l10,-25 l10,25 z M185,500 l-8,0 l8,-20 l8,20 z" fill="rgba(15, 25, 45, 0.8)" />
            <path d="M400,450 l-12,0 l12,-30 l12,30 z M420,450 l-10,0 l10,-25 l10,25 z M380,450 l-8,0 l8,-22 l8,22 z" fill="rgba(15, 25, 45, 0.8)" />
            
            {/* Center ridge trees */}
            <path d="M700,380 l-10,0 l10,-28 l10,28 z M720,385 l-8,0 l8,-22 l8,22 z M680,382 l-6,0 l6,-18 l6,18 z" fill="rgba(15, 25, 45, 0.7)" />
            <path d="M900,350 l-12,0 l12,-30 l12,30 z M920,355 l-8,0 l8,-22 l8,22 z" fill="rgba(15, 25, 45, 0.7)" />
            
            {/* Right ridge trees */}
            <path d="M1280,340 l-10,0 l10,-26 l10,26 z M1300,345 l-8,0 l8,-20 l8,20 z M1260,342 l-6,0 l6,-16 l6,16 z" fill="rgba(15, 25, 45, 0.7)" />
            <path d="M1600,320 l-12,0 l12,-32 l12,32 z M1620,325 l-10,0 l10,-26 l10,26 z M1580,322 l-8,0 l8,-20 l8,20 z" fill="rgba(15, 25, 45, 0.7)" />
          </g>
          
          {/* Layer 4: Foreground dark silhouette ridge with trees */}
          <path 
            d="M-100,800 L-100,650 
               L0,620 L100,580 L200,600 L280,540 L380,580 L480,520 
               L580,560 L680,500 L780,540 L880,480 L980,520 L1080,460 
               L1180,500 L1280,450 L1380,490 L1480,440 L1580,480 
               L1680,430 L1780,470 L1880,440 L2020,500 L2020,800 Z" 
            fill="url(#foregroundGradient)"
          />
          
          {/* Foreground tree silhouettes */}
          <g opacity="0.9">
            <path d="M100,580 l-18,0 l18,-45 l18,45 z M130,580 l-12,0 l12,-32 l12,32 z M70,580 l-10,0 l10,-28 l10,28 z" fill="rgba(7, 12, 26, 0.95)" />
            <path d="M500,520 l-15,0 l15,-40 l15,40 z M530,520 l-12,0 l12,-32 l12,32 z M470,520 l-10,0 l10,-26 l10,26 z" fill="rgba(7, 12, 26, 0.95)" />
            <path d="M880,480 l-16,0 l16,-42 l16,42 z M910,480 l-12,0 l12,-32 l12,32 z M850,480 l-10,0 l10,-26 l10,26 z" fill="rgba(7, 12, 26, 0.95)" />
            <path d="M1280,450 l-14,0 l14,-38 l14,38 z M1310,450 l-10,0 l10,-28 l10,28 z M1250,450 l-8,0 l8,-22 l8,22 z" fill="rgba(7, 12, 26, 0.95)" />
            <path d="M1680,430 l-16,0 l16,-44 l16,44 z M1710,430 l-12,0 l12,-34 l12,34 z M1650,430 l-10,0 l10,-28 l10,28 z" fill="rgba(7, 12, 26, 0.95)" />
          </g>
          
          {/* Mist layers floating between mountains */}
          <ellipse cx="400" cy="550" rx="300" ry="30" fill="rgba(100, 140, 200, 0.08)" />
          <ellipse cx="1000" cy="480" rx="400" ry="25" fill="rgba(120, 160, 220, 0.06)" />
          <ellipse cx="1500" cy="520" rx="350" ry="28" fill="rgba(100, 140, 200, 0.07)" />
          
          {/* Top mist overlay */}
          <rect x="0" y="200" width="1920" height="600" fill="url(#mistOverlay)" />
        </svg>
        
        {/* Atmospheric stars/particles in the sky above mountains */}
        <div className="absolute top-[20%] left-0 w-full h-[30%] opacity-30">
          {[...Array(12)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-blue-200"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                opacity: 0.3 + Math.random() * 0.5,
                animation: `pulse-glow ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
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
    </div>;
};
export default Index;