import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  BookOpen,
  Target,
  Trophy,
  Users,
  Shield,
  TrendingUp,
  Eye,
  Repeat,
  Zap,
  LineChart,
  Clock,
  Layers,
} from "lucide-react";

/* ─── Feature deep-dive rows (alternating left/right) ─── */
const deepFeatures = [
  {
    icon: CalendarDays,
    badge: "Journaling",
    title: "A calendar that tells your trading story",
    description:
      "Every day is colour-coded by P&L so patterns jump off the screen. Click any date to see individual trades, session breakdowns, notes, and screenshots — all in one place.",
    bullets: [
      "Colour-coded daily P&L at a glance",
      "Click-to-expand trade details per day",
      "Session & time-of-day tagging",
      "Attach screenshots & annotations",
    ],
  },
  {
    icon: BarChart3,
    badge: "Analytics",
    title: "Data-driven insights that sharpen your edge",
    description:
      "Equity curves, win-rate breakdowns by session, day-of-week heatmaps, risk-reward distributions, and running P&L — everything you need to find what's actually working.",
    bullets: [
      "Equity curve with drawdown overlay",
      "Win-rate by day, session & strategy",
      "Risk-reward distribution charts",
      "Performance comparison across accounts",
    ],
  },
  {
    icon: BookOpen,
    badge: "Playbooks",
    title: "Build a living playbook of your setups",
    description:
      "Define your A+ setups, tag every trade to a specific strategy, and watch your playbook evolve. Over time, see exactly which setups print money — and which to cut.",
    bullets: [
      "Create & organise multiple playbooks",
      "Tag trades to specific setups",
      "Track per-setup win-rate & expectancy",
      "Attach documentation & chart examples",
    ],
  },
  {
    icon: Eye,
    badge: "Reviews",
    title: "End every session with a guided review",
    description:
      "A structured, slide-based daily review that captures what went well, missed opportunities, lessons learned, and individual trade breakdowns with annotated screenshots.",
    bullets: [
      "Slide-based review workflow",
      "Screenshot upload & annotation",
      "Missed opportunities tracking",
      "Lessons-learned knowledge base",
    ],
  },
];

/* ─── Secondary feature pills ─── */
const secondaryFeatures = [
  { icon: Trophy, title: "Gamified Progress", desc: "Earn XP, unlock achievements, and level up as you build consistency." },
  { icon: Users, title: "Trading Rooms", desc: "Compete with peers in private rooms. Leaderboards and races keep you sharp." },
  { icon: Repeat, title: "Habit Tracking", desc: "Build daily trading habits with streak tracking and consistency scoring." },
  { icon: TrendingUp, title: "Prop Firm Tracker", desc: "Monitor evaluations, funded accounts, and drawdown limits in one place." },
  { icon: Target, title: "Dream Builder", desc: "Map financial goals and connect daily performance to your bigger vision." },
  { icon: Shield, title: "Risk Rules", desc: "Pre-trade checklists and custom risk rules that enforce discipline every entry." },
  { icon: Clock, title: "Session Analysis", desc: "Break down performance by London, New York, Asian sessions and more." },
  { icon: Layers, title: "Multi-Account", desc: "Track personal accounts, prop firms, and evaluations all in one dashboard." },
];

const stats = [
  { value: "6+", label: "Core Modules" },
  { value: "∞", label: "Trades Tracked" },
  { value: "100%", label: "Data Privacy" },
  { value: "24/7", label: "Cloud Access" },
];

export function FeatureShowcase() {
  return (
    <>
      {/* ── Deep Feature Rows ── */}
      <section className="relative w-full py-14 lg:py-20 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-7xl mx-auto space-y-20 lg:space-y-28">
          {/* Section header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.25em] mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Your complete trading{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                command centre
              </span>
            </h2>
          </motion.div>

          {/* Alternating feature rows */}
          {deepFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={feature.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${isEven ? "" : "lg:[direction:rtl]"}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Text side */}
                <div className={isEven ? "" : "lg:[direction:ltr]"}>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                    <Icon className="h-3.5 w-3.5" />
                    {feature.badge}
                  </span>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2.5">
                    {feature.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm md:text-base text-foreground/80">
                        <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual placeholder side */}
                <div className={`${isEven ? "" : "lg:[direction:ltr]"} rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm aspect-[4/3] flex items-center justify-center`}>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">{feature.badge} Preview</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-px mx-[10%]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Secondary Features Grid ── */}
      <section className="relative w-full py-14 lg:py-20 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-sm uppercase tracking-[0.25em] mb-3">
              And there's more
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Built for the long game
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {secondaryFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-5 rounded-xl border border-border/40 bg-card/25 hover:border-primary/25 hover:bg-card/50 transition-all duration-400"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-all">
                    <Icon className="h-4.5 w-4.5 text-primary/80" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-px mx-[10%]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Stats Strip ── */}
      <section className="relative w-full py-12 bg-[hsl(var(--background))]">
        <div className="relative z-10 px-[5%] max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {stats.map((stat) => (
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
