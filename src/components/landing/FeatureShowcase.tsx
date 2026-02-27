import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  BookOpen,
  Target,
  Trophy,
  Users,
  Shield,
  Repeat,
  TrendingUp,
  Eye,
  Zap,
  LineChart,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Visual Trade Calendar",
    description:
      "Log every trade on an interactive calendar. Color-coded days show your P&L at a glance — see winning streaks, losing days, and patterns over weeks and months.",
  },
  {
    icon: Eye,
    title: "Daily Review System",
    description:
      "End each session with a guided slide-based review. Capture screenshots, annotate charts, document what went well, missed opportunities, and key lessons.",
  },
  {
    icon: BookOpen,
    title: "Playbook Builder",
    description:
      "Define your setups, tag trades to strategies, and build a living playbook. See exactly which setups print money and which to cut.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Equity curves, win-rate breakdowns by session, day-of-week analysis, risk-reward distributions, and more. Data-driven insights to sharpen your edge.",
  },
  {
    icon: Target,
    title: "Dream Builder",
    description:
      "Visualise your financial goals. Map out dream purchases, calculate the monthly income required, and connect your daily trading to purpose.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Set custom risk rules per strategy. Pre-trade checklists enforce discipline before every entry — ensuring you stick to the plan.",
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
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function FeatureShowcase() {
  return (
    <>
      {/* Primary Features */}
      <section id="features" className="relative w-full py-14 lg:py-20 bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Your complete trading{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                command centre
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Built by traders, for traders. Every tool designed to turn raw data into actionable insight and lasting discipline.
            </p>
          </motion.div>

          {/* Features Grid - tighter gap */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
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
                  className="group relative rounded-xl border border-border/50 bg-card/40 p-6 transition-all duration-400 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="relative w-full py-12 lg:py-16 bg-[hsl(var(--secondary))]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
              And there's more
            </h2>
            <p className="text-muted-foreground text-base">Built for the long game</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                  className="group p-5 rounded-xl border border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50 transition-all duration-400"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary/80" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative w-full py-10 bg-[hsl(var(--background))] border-y border-border/20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { value: "6+", label: "Core Modules" },
              { value: "∞", label: "Trades Tracked" },
              { value: "100%", label: "Data Privacy" },
              { value: "24/7", label: "Cloud Access" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-xs uppercase tracking-[0.15em]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
