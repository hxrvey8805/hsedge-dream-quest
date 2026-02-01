import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Zap, TrendingUp, Sparkles, Lock } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import { motion } from "framer-motion";

const playbooks = [
  {
    id: "premarket-momentum",
    title: "Premarket Momentum Hunt",
    timeWindow: "12:00 - 14:30",
    icon: Zap,
    description: "Capture early momentum before the market opens. Learn to identify high-probability setups during the premarket session.",
    gradient: "from-amber-500/30 via-orange-600/20 to-red-900/10",
    glowColor: "rgba(245, 158, 11, 0.4)",
    iconColor: "text-amber-400",
    accentBorder: "border-amber-500/40",
  },
  {
    id: "golden-window",
    title: "The Golden Window",
    timeWindow: "14:30 - 15:00",
    icon: TrendingUp,
    description: "The most lucrative 30 minutes of the trading day. Master the art of trading the market open with precision.",
    gradient: "from-yellow-400/30 via-amber-500/20 to-orange-900/10",
    glowColor: "rgba(250, 204, 21, 0.4)",
    iconColor: "text-yellow-400",
    accentBorder: "border-yellow-400/40",
  },
  {
    id: "second-wave",
    title: "Second Wave Scalps",
    timeWindow: "15:00 - 17:00",
    icon: Clock,
    description: "Ride the secondary momentum waves. Learn to scalp effectively during the mid-day trading session.",
    gradient: "from-blue-500/30 via-cyan-600/20 to-indigo-900/10",
    glowColor: "rgba(59, 130, 246, 0.4)",
    iconColor: "text-blue-400",
    accentBorder: "border-blue-500/40",
  },
];

export default function Playbooks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Atmospheric background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a1628] to-[#030712]" />
        
        {/* Mysterious ambient orbs */}
        <div 
          className="ambient-orb w-[600px] h-[600px] -top-40 -left-40 opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(212 80% 40%) 0%, transparent 70%)' }}
        />
        <div 
          className="ambient-orb w-[500px] h-[500px] top-1/3 -right-40 opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(45 90% 50%) 0%, transparent 70%)', animationDelay: '4s' }}
        />
        <div 
          className="ambient-orb w-[400px] h-[400px] bottom-20 left-1/4 opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(200 80% 50%) 0%, transparent 70%)', animationDelay: '8s' }}
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="lucid-particle"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              '--drift-x': `${(Math.random() - 0.5) * 100}px`,
              '--drift-y': `${Math.random() * 80}px`,
              opacity: 0.3 + Math.random() * 0.3,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} alt="TradePeaks" className="h-8 w-8 animate-logo-float" />
            <span className="text-lg font-semibold text-white">The Vault</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <Lock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Sacred Knowledge</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-[5%]">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-white/70 tracking-wide">Ancient Trading Wisdom</span>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Trading isn't about{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              quick wins
            </span>
          </motion.h1>

          <motion.div 
            className="space-y-5 text-white/60 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p>
              The majority of strategies online consist of gambling and luck — setups that would get you{" "}
              <span className="text-red-400/80 font-medium">fired</span> from a real proprietary trading firm.
            </p>
            <p>
              Real trading education is about{" "}
              <span className="text-white font-medium">process</span>,{" "}
              <span className="text-white font-medium">journaling</span>,{" "}
              <span className="text-white font-medium">playbooking</span> and{" "}
              <span className="text-white font-medium">risk control</span> — not flashy entries and exits.
            </p>
            <p className="text-primary font-medium pt-2">
              TradePeaks is where you'll find real education, not hype.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="relative h-px mx-[10%]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
      </div>

      {/* Playbooks Grid */}
      <section className="py-20 lg:py-28 px-[5%]">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The Books of{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">Knowledge</span>
            </h2>
            <p className="text-white/40 text-sm uppercase tracking-[0.3em]">Unlock the secrets within</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {playbooks.map((playbook, index) => {
              const IconComponent = playbook.icon;
              return (
                <motion.div
                  key={playbook.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.15, duration: 0.6 }}
                  className="group relative"
                >
                  {/* Glow effect behind card */}
                  <div 
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ background: playbook.glowColor }}
                  />
                  
                  {/* Main card */}
                  <div
                    className={`relative bg-gradient-to-b ${playbook.gradient} backdrop-blur-sm border ${playbook.accentBorder} rounded-xl p-7 transition-all duration-500 cursor-pointer overflow-hidden group-hover:scale-[1.02] group-hover:border-white/30`}
                    style={{ 
                      boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Book spine effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                    
                    {/* Book pages effect */}
                    <div className="absolute right-1 top-6 bottom-6 w-1 bg-white/5 rounded-r" />
                    <div className="absolute right-2.5 top-8 bottom-8 w-0.5 bg-white/3 rounded-r" />

                    {/* Mystical corner decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                      <div className="absolute top-3 right-3 w-8 h-px bg-gradient-to-l from-white/40 to-transparent" />
                      <div className="absolute top-3 right-3 w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
                    </div>

                    <div className="relative z-10 pl-3">
                      {/* Icon with glow */}
                      <div 
                        className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${playbook.iconColor} border border-white/10 group-hover:border-white/20 transition-all duration-300`}
                        style={{ boxShadow: `0 0 30px ${playbook.glowColor.replace('0.4', '0.2')}` }}
                      >
                        <IconComponent className="h-7 w-7" />
                      </div>

                      {/* Time window badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 mb-5">
                        <Clock className="h-3.5 w-3.5 text-white/50" />
                        <span className="text-xs text-white/70 font-mono tracking-wider">{playbook.timeWindow}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-white transition-colors">
                        {playbook.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-white/50 leading-relaxed mb-6">
                        {playbook.description}
                      </p>

                      {/* Coming soon indicator */}
                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <Lock className="h-3 w-3 text-white/30" />
                        <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Coming Soon</span>
                      </div>
                    </div>

                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
                          animation: 'shimmer 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-[5%] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <motion.div 
          className="max-w-2xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/50 mb-8 text-lg">
            Ready to trade with a{" "}
            <span className="text-white font-medium">real edge</span>?
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-white px-10 py-6 text-base font-medium shadow-glow transition-all duration-300 hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)]"
          >
            Join TradePeaks
          </Button>
        </motion.div>
      </section>
    </div>
  );
}