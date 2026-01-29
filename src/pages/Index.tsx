import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import blueMoon from "@/assets/blue-moon.png";
import mountainsNocturnal from "@/assets/mountains-nocturnal.png";
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
      {/* Immersive nocturnal mountains – two peaks, misty forest, blue drama */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute bottom-0 left-0 right-0 min-h-[55vh] md:min-h-[65vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${mountainsNocturnal})`,
            backgroundPosition: "center bottom",
          }}
        />
        {/* Blend top of mountains into page background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #070C1A 0%, #070C1A 15%, transparent 45%)",
          }}
        />
        {/* Subtle blue tint overlay to match TradePeaks palette */}
        <div
          className="absolute bottom-0 left-0 right-0 min-h-[55vh] md:min-h-[65vh] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(30, 64, 175, 0.12) 0%, transparent 50%)",
          }}
        />
      </div>
      {/* Radial gradient overlay – soft top glow, gentle bottom blend over mountains */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
      background: `
            radial-gradient(
              80rem 40rem at 50% -10%,
              rgba(16, 40, 90, 0.5),
              transparent 60%
            ),
            radial-gradient(
              80rem 35rem at 50% 110%,
              rgba(7, 12, 26, 0.35),
              transparent 55%
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
            {/* Moon: half visible, top cut off; blue light reflected from TradePeaks text */}
            <div
              className="animate-fade-in relative mx-auto mb-2 md:mb-4 overflow-hidden"
              style={{ height: "clamp(72px, 18vw, 120px)" }}
              aria-hidden
            >
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[clamp(144px, 36vw, 240px)] aspect-square rounded-full"
                style={{
                  boxShadow:
                    "0 0 80px rgba(59, 130, 246, 0.5), 0 0 140px rgba(34, 211, 238, 0.25), inset 0 -20px 40px rgba(96, 165, 250, 0.2)",
                  filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))",
                }}
              >
                <img
                  src={blueMoon}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(96, 165, 250, 0.35) 0%, rgba(59, 130, 246, 0.15) 35%, transparent 70%)",
                  }}
                />
              </div>
            </div>
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