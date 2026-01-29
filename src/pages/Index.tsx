import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import { useMemo, useRef } from "react";
const Index = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate sparse stars for Twin Peaks atmosphere
  const stars = useMemo(() => {
    return Array.from({
      length: 25
    }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 40, // Only in upper portion
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  return <div ref={containerRef} className="min-h-screen bg-[#0a0f1a] relative overflow-hidden">
      {/* Glowing Moon */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 pointer-events-none z-0">
        {/* Outer glow rings */}
        <div className="absolute inset-0 w-[280px] h-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-amber-100/20 via-amber-200/5 to-transparent blur-3xl" />
        <div className="absolute inset-0 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-amber-50/30 via-orange-100/10 to-transparent blur-2xl" />
        {/* Moon body */}
        <div 
          className="moon w-[120px] h-[120px] rounded-full relative -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #fff9e6 0%, #f5e6c8 30%, #e8d4a8 60%, #d4b896 100%)',
            boxShadow: '0 0 60px rgba(255, 245, 200, 0.5), 0 0 120px rgba(255, 220, 150, 0.3), inset -10px -10px 20px rgba(200, 170, 120, 0.3)'
          }}
        />
      </div>

      {/* Twin Peaks Mountain Silhouettes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-[70%]" viewBox="0 0 1200 500" preserveAspectRatio="none">
          <defs>
            {/* Gradient for distant mountains */}
            <linearGradient id="distantMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(45, 55, 92, 0.4)" />
              <stop offset="100%" stopColor="rgba(25, 32, 55, 0.6)" />
            </linearGradient>
            {/* Gradient for mid mountains */}
            <linearGradient id="midMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(35, 48, 82, 0.7)" />
              <stop offset="100%" stopColor="rgba(18, 25, 45, 0.85)" />
            </linearGradient>
            {/* Gradient for twin peaks - with warm highlight */}
            <linearGradient id="twinPeaks" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(60, 75, 110, 0.8)" />
              <stop offset="30%" stopColor="rgba(40, 55, 90, 0.85)" />
              <stop offset="100%" stopColor="rgba(15, 22, 40, 0.95)" />
            </linearGradient>
            {/* Foreground gradient */}
            <linearGradient id="foreground" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(12, 18, 35, 0.95)" />
              <stop offset="100%" stopColor="rgba(10, 15, 26, 1)" />
            </linearGradient>
            {/* Mist gradient */}
            <linearGradient id="mistGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(80, 100, 140, 0)" />
              <stop offset="50%" stopColor="rgba(80, 100, 140, 0.15)" />
              <stop offset="100%" stopColor="rgba(80, 100, 140, 0)" />
            </linearGradient>
          </defs>
          
          {/* Far distant range - very hazy */}
          <path d="M0,500 L0,320 L100,280 L200,300 L350,250 L500,290 L650,240 L800,270 L950,230 L1100,260 L1200,240 L1200,500 Z" fill="url(#distantMountain)" />
          
          {/* Mid-layer rolling hills with subtle peaks */}
          <path d="M0,500 L0,350 L80,320 L180,340 L280,290 L400,330 L520,280 L680,310 L780,270 L880,300 L1000,260 L1120,290 L1200,270 L1200,500 Z" fill="url(#midMountain)" />
          
          {/* Mist layer 1 */}
          <rect x="-50" y="300" width="1300" height="60" fill="url(#mistGradient)" className="mist-layer" style={{ opacity: 0.5 }} />
          
          {/* THE TWIN PEAKS - signature silhouette */}
          <path d="M350,500 L500,180 L550,220 L600,160 L650,220 L700,180 L850,500 Z" fill="url(#twinPeaks)" />
          {/* Snow caps on twin peaks */}
          <path d="M500,180 L515,210 L485,210 Z" fill="rgba(255, 255, 255, 0.12)" />
          <path d="M700,180 L715,210 L685,210 Z" fill="rgba(255, 255, 255, 0.12)" />
          {/* Moon glow reflection on peaks */}
          <path d="M550,220 L600,160 L650,220 L600,200 Z" fill="rgba(255, 240, 200, 0.08)" />
          
          {/* Mist layer 2 - between peaks and foreground */}
          <rect x="-50" y="380" width="1300" height="50" fill="url(#mistGradient)" className="mist-layer" style={{ opacity: 0.7, animationDelay: '-10s' }} />
          
          {/* Foreground ridge with pine tree silhouettes */}
          <path d="M0,500 L0,420 L40,410 L80,420 L120,400 L160,415 L200,395 L250,410 L300,390 L350,405 L400,385 L450,400 L500,380 L550,395 L600,375 L650,390 L700,370 L750,385 L800,365 L850,380 L900,360 L950,375 L1000,355 L1050,370 L1100,350 L1150,365 L1200,345 L1200,500 Z" fill="url(#foreground)" />
          
          {/* Pine tree silhouettes on foreground ridge */}
          {/* Left side trees */}
          <path d="M50,420 L55,395 L60,420 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M70,418 L77,388 L84,418 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M130,405 L138,370 L146,405 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M150,408 L156,380 L162,408 Z" fill="rgba(8, 12, 22, 1)" />
          {/* Center trees */}
          <path d="M580,378 L590,340 L600,378 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M610,380 L618,350 L626,380 Z" fill="rgba(8, 12, 22, 1)" />
          {/* Right side trees */}
          <path d="M950,365 L960,325 L970,365 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M1020,360 L1030,320 L1040,360 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M1080,355 L1092,310 L1104,355 Z" fill="rgba(8, 12, 22, 1)" />
          <path d="M1130,362 L1140,328 L1150,362 Z" fill="rgba(8, 12, 22, 1)" />
        </svg>
      </div>

      {/* Atmospheric gradient overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(
            ellipse 100% 60% at 50% 15%,
            rgba(255, 220, 150, 0.08),
            transparent 50%
          ),
          radial-gradient(
            ellipse 80% 40% at 50% 100%,
            rgba(10, 15, 26, 0.9),
            transparent 60%
          ),
          linear-gradient(
            to bottom,
            rgba(15, 20, 35, 0.3) 0%,
            transparent 30%,
            transparent 70%,
            rgba(10, 15, 26, 0.5) 100%
          )
        `
      }} />

      {/* Sparse twinkling stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map(star => (
          <div 
            key={star.id} 
            className="star absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
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