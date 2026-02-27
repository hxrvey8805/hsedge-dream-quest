import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  BookOpen,
  Target,
  Trophy,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Eye,
  Repeat,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Visual Trade Calendar",
    description:
      "Log every trade on an interactive calendar. Color-coded days show your P&L at a glance — see winning streaks, losing days, and patterns emerge over weeks and months.",
    accent: "primary",
  },
  {
    icon: Eye,
    title: "Daily Review System",
    description:
      "End each session with a guided slide-based review. Capture screenshots, annotate charts, document what went well, missed opportunities, and key lessons learned.",
    accent: "primary",
  },
  {
    icon: BookOpen,
    title: "Playbook Builder",
    description:
      "Define your setups, tag trades to specific strategies, and build a living playbook. Over time, see exactly which setups print money and which to cut.",
    accent: "primary",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Equity curves, win-rate breakdowns by session, day-of-week analysis, risk-reward distributions, and more. Data-driven insights to sharpen your edge.",
    accent: "primary",
  },
  {
    icon: Target,
    title: "Dream Builder",
    description:
      "Visualise your financial goals. Map out dream purchases, calculate the monthly income required, and connect your daily trading to a purpose that drives you.",
    accent: "primary",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Set custom risk rules per strategy. Pre-trade checklists enforce discipline before every entry — ensuring you stick to the plan, every single time.",
    accent: "primary",
  },
];

const secondaryFeatures = [
  {
    icon: Trophy,
    title: "Gamified Progress",
    description: "Earn XP, unlock achievements, and level up as you build consistency.",
  },
  {
    icon: Users,
    title: "Trading Rooms",
    description: "Compete with peers in private rooms. Leaderboards and profit races keep you accountable.",
  },
  {
    icon: Repeat,
    title: "Habit Tracking",
    description: "Build daily trading habits with streak tracking and consistency scoring.",
  },
  {
    icon: TrendingUp,
    title: "Prop Firm Tracker",
    description: "Monitor evaluations, funded accounts, and drawdown limits all in one place.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function FeatureShowcase() {
  return (
    <>
      {/* Primary Features Grid */}
      <section className="relative w-full py-20 lg:py-28 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.25em] mb-4">
              Everything you need
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Your complete trading{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                command centre
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Built by traders, for traders. Every tool designed to turn raw data into actionable insight and lasting discipline.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/30 hover:bg-card/60 hover:shadow-[0_0_50px_hsl(var(--primary)/0.08)]"
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-500">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary-foreground transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-px mx-[10%]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Secondary Features Row */}
      <section className="relative w-full py-20 lg:py-24 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-sm uppercase tracking-[0.25em] mb-4">
              And there's more
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Built for the long game
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {secondaryFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group text-center p-6 rounded-xl border border-border/30 bg-card/20 hover:border-border/60 hover:bg-card/40 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/12 transition-all duration-500">
                    <Icon className="h-5 w-5 text-primary/80" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-px mx-[10%]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Social Proof / Stats Strip */}
      <section className="relative w-full py-16 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {[
              { value: "6+", label: "Core Modules" },
              { value: "∞", label: "Trades Tracked" },
              { value: "100%", label: "Data Privacy" },
              { value: "24/7", label: "Cloud Access" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-xs uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
