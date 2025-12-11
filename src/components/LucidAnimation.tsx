import { useMemo, useState, useEffect, useRef } from "react";

interface LucidAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

const LucidAnimation = ({ onComplete, duration = 3000 }: LucidAnimationProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate deep blue illuminated floating particles
  const lucidParticles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 25,
      size: Math.random() * 6 + 3,
      opacity: 0.5 + Math.random() * 0.5,
      driftX: Math.random() * 150 - 75,
      driftY: Math.random() * 100 + 50,
      magnetStrength: 0.15 + Math.random() * 0.2,
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
      y: dy * strength * 0.5,
    };
  };

  // Auto-complete after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 bg-[#070C1A] z-[9999] flex items-center justify-center overflow-hidden"
    >
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
      
      {/* Floating particles container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {lucidParticles.map((particle) => {
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
                transition: 'transform 0.3s ease-out',
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Welcome message */}
      <div className="relative z-10 text-center animate-fade-in">
        <h1 
          className="text-6xl md:text-8xl font-light italic mb-4"
          style={{
            fontFamily: "'Playfair Display', 'Dancing Script', 'Georgia', serif",
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(59, 130, 246, 0.6), 0 0 120px rgba(34, 211, 238, 0.3)',
            letterSpacing: '0.08em',
            fontWeight: 300,
            filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))'
          }}
        >
          Welcome to TradeLucid
        </h1>
        <p className="text-2xl text-blue-200/80 animate-pulse">
          Entering your trading journey...
        </p>
      </div>
    </div>
  );
};

export default LucidAnimation;
