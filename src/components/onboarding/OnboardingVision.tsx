import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Clock } from "lucide-react";

interface OnboardingVisionProps {
  onContinue: () => void;
  onSkip: () => void;
}

export const OnboardingVision = ({ onContinue, onSkip }: OnboardingVisionProps) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative inline-block mb-8">
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center mx-auto"
            animate={{ 
              boxShadow: [
                "0 0 40px hsl(212 98% 62% / 0.3)",
                "0 0 80px hsl(212 98% 62% / 0.5)",
                "0 0 40px hsl(212 98% 62% / 0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          
          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-accent"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [Math.cos((i * 2 * Math.PI) / 3) * 80, Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 80],
                y: [Math.sin((i * 2 * Math.PI) / 3) * 80, Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 80],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
            />
          ))}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Before you trade,
          </span>
          <br />
          <span className="text-foreground">define what winning</span>
          <br />
          <span className="bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
            actually looks like.
          </span>
        </h1>

        <motion.p 
          className="text-xl text-muted-foreground max-w-xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your trading journey isn't just about pips and profits. It's about the life you're building.
        </motion.p>

        <motion.p 
          className="text-lg text-muted-foreground/80 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Let's create your primary vision — the dream life that motivates every trade you make.
        </motion.p>
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          size="lg"
          className="premium-button px-12 py-6 text-lg min-w-[200px]"
          onClick={onContinue}
        >
          Create My Vision
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          <Clock className="w-4 h-4 mr-2" />
          I'll do this later
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div 
        className="mt-16 grid md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {[
          { title: "Track Progress", desc: "See how your trading gets you closer to your dreams" },
          { title: "Stay Motivated", desc: "Visual reminders of why you trade" },
          { title: "Real Goals", desc: "Connect profits to actual life purchases" },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl bg-secondary/30 backdrop-blur-sm">
            <h4 className="font-semibold text-primary mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
