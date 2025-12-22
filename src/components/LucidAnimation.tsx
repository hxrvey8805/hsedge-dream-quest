import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LucidAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

const LucidAnimation = ({ onComplete, duration = 3500 }: LucidAnimationProps) => {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');
  const containerRef = useRef<HTMLDivElement>(null);

  // Phase timing
  useEffect(() => {
    const logoTimer = setTimeout(() => setPhase('text'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), duration - 500);
    const completeTimer = setTimeout(() => onComplete?.(), duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  // Generate elegant particles
  const particles = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
      duration: 15 + Math.random() * 20,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  // Floating rings for depth
  const rings = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      size: 200 + i * 150,
      delay: i * 0.3,
      duration: 20 + i * 5,
    }));
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(220 40% 8%) 0%, hsl(220 50% 4%) 50%, hsl(220 60% 2%) 100%)'
          }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at 30% 20%, hsl(212 80% 40% / 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 80%, hsl(212 80% 40% / 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 20%, hsl(212 80% 40% / 0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Accent color accent */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              background: 'radial-gradient(circle at 50% 50%, hsl(163 100% 50% / 0.05) 0%, transparent 40%)'
            }}
          />

          {/* Rotating rings */}
          {rings.map((ring) => (
            <motion.div
              key={ring.id}
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: ring.size,
                height: ring.size,
                borderColor: 'hsl(212 80% 50% / 0.1)',
                borderWidth: 1,
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0.3, 0],
                scale: [0.8, 1, 1.1, 1.2],
                rotate: 360 
              }}
              transition={{
                duration: ring.duration,
                delay: ring.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  background: `radial-gradient(circle, hsl(212 90% 60% / ${particle.opacity}) 0%, transparent 70%)`,
                  boxShadow: `0 0 ${particle.size * 3}px hsl(212 90% 60% / ${particle.opacity * 0.5})`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, particle.opacity, particle.opacity, 0],
                  scale: [0, 1, 1, 0],
                  y: [0, -100, -200],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* TradeLucid text with glow - matching homepage style */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Glow behind text */}
              <motion.div
                className="absolute inset-0 blur-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, hsl(212 98% 62% / 0.4) 0%, transparent 70%)',
                  width: 300,
                  height: 150,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <motion.h1
                className="text-6xl md:text-7xl lg:text-8xl font-light italic relative z-10"
                style={{
                  fontFamily: "'Playfair Display', 'Dancing Script', 'Georgia', serif",
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.08em',
                  fontWeight: 300,
                  filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))',
                }}
                animate={{
                  y: [0, -8, 0],
                  filter: [
                    'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                    'drop-shadow(0 0 60px rgba(59, 130, 246, 0.7))',
                    'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                TradeLucid
              </motion.h1>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase !== 'logo' ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider mb-4"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ 
                  opacity: phase !== 'logo' ? 1 : 0, 
                  y: phase !== 'logo' ? 0 : 30,
                  filter: phase !== 'logo' ? 'blur(0px)' : 'blur(10px)',
                }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(212 60% 80%) 50%, hsl(163 80% 60%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Welcome
              </motion.h1>

              <motion.div
                className="overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase !== 'logo' ? 1 : 0, 
                  y: phase !== 'logo' ? 0 : 20 
                }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-lg md:text-xl text-muted-foreground/80 tracking-wide">
                  Preparing your trading dashboard
                </p>
              </motion.div>

              {/* Loading indicator */}
              <motion.div
                className="mt-8 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase !== 'logo' ? 1 : 0 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, hsl(220 60% 2%), transparent)'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LucidAnimation;