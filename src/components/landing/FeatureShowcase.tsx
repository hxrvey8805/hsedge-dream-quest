import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  BookOpen,
  Target,
  Trophy,
  Shield,
  TrendingUp,
  Eye,
  Repeat,
  Zap,
  Layers,
  Mountain,
  Focus,
  ClipboardCheck,
  LineChart,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarPreview } from "./previews/CalendarPreview";
import { AnalyticsPreview } from "./previews/AnalyticsPreview";
import { PlaybookPreview } from "./previews/PlaybookPreview";
import { ReviewPreview } from "./previews/ReviewPreview";

const cx = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"; // consistent container
const cxNarrow = "mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8";

const sectionAnim = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6 },
};

const Divider = () => (
  <div className={cx}>
    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </div>
);

/* ─── The Problem ─── */
const problems = [
  "Repeating the same mistake month after month?",
  "Not sure what skill you should be improving?",
  "Journaling… but not actually evolving?",
  "Unsure if you're truly making progress?",
];

/* ─── The System Steps ─── */
const systemSteps = [
  { num: "1", icon: Mountain, title: "Define Your Summit", lines: ["Use the Dream Builder to clarify your end goal.", "Know exactly what you're trading for."] },
  { num: "2", icon: Focus, title: "Focus Your Climb", lines: ["Start each day with intention.", "Identify the single most important area to improve."] },
  { num: "3", icon: ClipboardCheck, title: "Execute With Discipline", lines: ["Follow risk rules, playbooks, and pre-trade checklists."] },
  { num: "4", icon: Eye, title: "Review With Structure", lines: ["Complete a guided Daily Report Card that forces reflection and adjustment."] },
  { num: "5", icon: LineChart, title: "Track Visible Progress", lines: ["Watch your consistency, skill metrics, and edge evolve over time."] },
];

/* ─── Built for the Long Game ─── */
const longGameFeatures = [
  { icon: Trophy, text: "Gamified progress that rewards consistency" },
  { icon: Repeat, text: "Habit tracking that builds structure" },
  { icon: TrendingUp, text: "Prop firm tracking for serious capital" },
  { icon: Shield, text: "Risk rules that enforce discipline" },
  { icon: Layers, text: "Multi-account analytics" },
];

export function FeatureShowcase({ onStartClimbing }: { onStartClimbing: () => void }) {
  return (
    <>
      {/* ── THE PROBLEM ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cxNarrow + " text-center"}>
          <motion.div {...sectionAnim}>
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.25em] mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
              Trading without direction is{" "}
              <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">expensive.</span>
            </h2>

            <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-muted-foreground text-sm md:text-base">
                  <AlertTriangle className="h-4 w-4 text-red-400/70 mt-1 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-2">
              Without a defined focus and structured review, trading becomes random effort.
            </p>
            <p className="text-foreground font-medium text-sm md:text-base">
              TradePeaks turns every session into <span className="text-primary">deliberate practice.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── THE SYSTEM ── */}
      <section id="system" className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx}>
          <motion.div {...sectionAnim} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.25em] mb-3">The TradePeaks System</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              A performance framework{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                disguised as software.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {systemSteps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  {...sectionAnim}
                  className="rounded-xl border border-border/50 bg-card/30 p-6 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {step.num}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <div className="space-y-1.5">
                    {step.lines.map((l) => (
                      <p key={l} className="text-sm text-muted-foreground leading-relaxed">{l}</p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div {...sectionAnim} className="text-center mt-10 space-y-1">
            <p className="text-muted-foreground text-sm">This is how traders adapt to market regimes.</p>
            <p className="text-foreground font-medium text-sm">This is how growth <span className="text-primary">compounds.</span></p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── CALENDAR SECTION ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                <CalendarDays className="h-3.5 w-3.5" />
                Journaling
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                Your Trading Story — Visualised
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Every day tells a story. TradePeaks makes it impossible to ignore the patterns.
              </p>
              <ul className="space-y-2.5 mb-6">
                {["Colour-coded P&L", "Session breakdowns", "Annotated screenshots", "Missed opportunities", "Lessons learned"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm italic">
                This isn't just a calendar. <span className="text-foreground font-medium not-italic">It's your climb, mapped out.</span>
              </p>
            </div>
            <div className="aspect-[4/3]">
              <CalendarPreview />
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── ANALYTICS ── */}
      <section id="analytics" className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:[direction:rtl]">
            <div className="lg:[direction:ltr]">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                Know what actually drives your edge.
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Equity curves don't lie. Neither do heatmaps. TradePeaks shows you:
              </p>
              <ul className="space-y-2.5 mb-6">
                {["Which sessions you dominate", "Which setups print money", "Where drawdowns begin", "How risk discipline affects outcomes"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-foreground font-medium text-sm">
                No guessing. No illusions. Just <span className="text-primary">clarity.</span>
              </p>
            </div>
            <div className="lg:[direction:ltr] aspect-[4/3]">
              <AnalyticsPreview />
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── PLAYBOOKS ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                <BookOpen className="h-3.5 w-3.5" />
                Playbooks
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                Build a living system of your A+ setups.
              </h3>
              <ul className="space-y-2.5 mb-6">
                {["Tag every trade", "Track expectancy per setup", "Cut what doesn't work", "Double down on what does"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm italic">
                Over time, your playbook becomes sharper — <span className="text-foreground font-medium not-italic">and so do you.</span>
              </p>
            </div>
            <div className="aspect-[4/3]">
              <PlaybookPreview />
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── DAILY REVIEWS ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:[direction:rtl]">
            <div className="lg:[direction:ltr]">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                <Eye className="h-3.5 w-3.5" />
                Daily Reviews
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                End every session with intention.
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                The Daily Report Card is where evolution happens.
              </p>
              <ul className="space-y-2.5 mb-6">
                {["What was today's focus?", "Did you execute on it?", "What moved the needle?", "What must change tomorrow?"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm mb-1">Without reflection, there is no growth.</p>
              <p className="text-foreground font-medium text-sm">
                With structure, progress becomes <span className="text-primary">visible.</span>
              </p>
            </div>
            <div className="lg:[direction:ltr] aspect-[4/3]">
              <ReviewPreview />
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── DREAM BUILDER ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cxNarrow + " text-center"}>
          <motion.div {...sectionAnim}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
              <Target className="h-3.5 w-3.5" />
              Dream Builder
            </span>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Trade for something real.
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">Your vision is not abstract. Connect:</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Daily execution", "Monthly consistency", "Financial goals", "Life design"].map((item, i, arr) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground bg-card/40 border border-border/50 rounded-lg px-3 py-1.5">{item}</span>
                  {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-primary/60" />}
                </span>
              ))}
            </div>
            <p className="text-foreground font-medium text-sm">
              When your purpose is clear, discipline becomes <span className="text-primary">easier.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── BUILT FOR THE LONG GAME ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx + " text-center"}>
          <motion.div {...sectionAnim}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-8">
              Built for the Long Game
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 text-left max-w-4xl mx-auto">
              {longGameFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/20">
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80">{f.text}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground text-sm mb-1">Everything supports one goal:</p>
            <p className="text-foreground font-semibold text-base">
              <span className="text-primary">Deliberate improvement.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FINAL CTA ── */}
      <section className="relative w-full py-16 lg:py-24 bg-[hsl(var(--background))]">
        <div className={cx + " flex items-center justify-center"}>
          <Card className="max-w-3xl w-full bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Ready to climb?
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] rounded-full mb-6 mx-auto" />

            <p className="text-muted-foreground text-sm mb-1">TradePeaks isn't for gamblers.</p>
            <p className="text-muted-foreground text-base mb-6">It's for traders who want:</p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Direction", "Structure", "Deliberate progress", "A visible path to mastery"].map((item) => (
                <span key={item} className="text-sm font-medium text-foreground bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5">
                  {item}
                </span>
              ))}
            </div>

            <p className="text-foreground font-semibold text-lg mb-8">Welcome to TradePeaks.</p>

            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-medium shadow-[var(--shadow-glow)] transition-all duration-300 hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)]"
              onClick={onStartClimbing}
            >
              Start Free Trial
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
