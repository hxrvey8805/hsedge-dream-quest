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

const cx = "mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-16";
const cxNarrow = "mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-10 xl:px-16";

const sectionAnim = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6 },
};

const Divider = () => (
  <div className={cx}>
    <div className="relative h-px">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
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
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cxNarrow + " text-center"}>
          <motion.div {...sectionAnim}>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">The Problem</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-8 leading-[1.05]">
              Trading without direction is{" "}
              <span className="bg-gradient-to-r from-destructive to-red-400 bg-clip-text text-transparent">expensive.</span>
            </h2>

            <ul className="space-y-4 mb-10 text-left max-w-md mx-auto">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-muted-foreground text-base">
                  <AlertTriangle className="h-4 w-4 text-destructive/70 mt-1 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground text-base leading-relaxed mb-2">
              Without a defined focus and structured review, trading becomes random effort.
            </p>
            <p className="text-foreground font-semibold text-lg">
              TradePeaks turns every session into <span className="text-primary">deliberate practice.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── THE SYSTEM ── */}
      <section id="system" className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx}>
          <motion.div {...sectionAnim} className="text-center mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">The TradePeaks System</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05]">
              A performance framework{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                disguised as software.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {systemSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group rounded-xl border border-border/50 bg-card/30 p-7 hover:border-primary/40 hover:bg-card/50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, hsl(212 98% 62% / 0.08), transparent 60%)' }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary/20 transition-colors">
                        {step.num}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {step.lines.map((l) => (
                        <p key={l} className="text-sm text-muted-foreground leading-relaxed">{l}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div {...sectionAnim} className="text-center mt-12 space-y-1">
            <p className="text-muted-foreground text-base">This is how traders adapt to market regimes.</p>
            <p className="text-foreground font-semibold text-lg">This is how growth <span className="text-primary">compounds.</span></p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── CALENDAR SECTION ── */}
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
                <CalendarDays className="h-3.5 w-3.5" />
                Journaling
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
                Your Trading Story — Visualised
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Every day tells a story. TradePeaks makes it impossible to ignore the patterns.
              </p>
              <ul className="space-y-3 mb-6">
                {["Colour-coded P&L", "Session breakdowns", "Annotated screenshots", "Missed opportunities", "Lessons learned"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm italic">
                This isn't just a calendar. <span className="text-foreground font-semibold not-italic">It's your climb, mapped out.</span>
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
      <section id="analytics" className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:[direction:rtl]">
            <div className="lg:[direction:ltr]">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
                Know what actually drives your edge.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Equity curves don't lie. Neither do heatmaps. TradePeaks shows you:
              </p>
              <ul className="space-y-3 mb-6">
                {["Which sessions you dominate", "Which setups print money", "Where drawdowns begin", "How risk discipline affects outcomes"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-foreground font-semibold text-lg">
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
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
                <BookOpen className="h-3.5 w-3.5" />
                Playbooks
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
                Build a living system of your A+ setups.
              </h3>
              <ul className="space-y-3 mb-6">
                {["Tag every trade", "Track expectancy per setup", "Cut what doesn't work", "Double down on what does"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/80">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm italic">
                Over time, your playbook becomes sharper — <span className="text-foreground font-semibold not-italic">and so do you.</span>
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
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx}>
          <motion.div {...sectionAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:[direction:rtl]">
            <div className="lg:[direction:ltr]">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
                <Eye className="h-3.5 w-3.5" />
                Daily Reviews
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
                End every session with intention.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The Daily Report Card is where evolution happens.
              </p>
              <ul className="space-y-3 mb-6">
                {["What was today's focus?", "Did you execute on it?", "What moved the needle?", "What must change tomorrow?"].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/80">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-base mb-1">Without reflection, there is no growth.</p>
              <p className="text-foreground font-semibold text-lg">
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
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cxNarrow + " text-center"}>
          <motion.div {...sectionAnim}>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
              <Target className="h-3.5 w-3.5" />
              Dream Builder
            </span>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 tracking-tight">
              Trade for something real.
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">Your vision is not abstract. Connect:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["Daily execution", "Monthly consistency", "Financial goals", "Life design"].map((item, i, arr) => (
                <span key={item} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground bg-card/40 border border-border/50 rounded-lg px-4 py-2">{item}</span>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-primary/60" />}
                </span>
              ))}
            </div>
            <p className="text-foreground font-semibold text-lg">
              When your purpose is clear, discipline becomes <span className="text-primary">easier.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── BUILT FOR THE LONG GAME ── */}
      <section className="relative w-full py-20 lg:py-32 bg-background">
        <div className={cx + " text-center"}>
          <motion.div {...sectionAnim}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-10">
              Built for the Long Game
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 text-left max-w-4xl mx-auto">
              {longGameFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-3 p-4 rounded-xl border border-border/30 bg-card/20 hover:border-primary/30 transition-colors duration-300">
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-foreground/80">{f.text}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground text-base mb-1">Everything supports one goal:</p>
            <p className="text-foreground font-black text-xl">
              <span className="text-primary">Deliberate improvement.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FINAL CTA ── */}
      <section className="relative w-full py-20 lg:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(212 98% 62% / 0.06), transparent 60%)' }} />
        <div className={cx + " flex items-center justify-center relative z-10"}>
          <div className="max-w-3xl w-full text-center">
            <motion.div {...sectionAnim}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tight">
                Ready to climb?
              </h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-primary-glow rounded-full mb-8 mx-auto" />

              <p className="text-muted-foreground text-base mb-1">TradePeaks isn't for gamblers.</p>
              <p className="text-muted-foreground text-lg mb-8">It's for traders who want:</p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["Direction", "Structure", "Deliberate progress", "A visible path to mastery"].map((item) => (
                  <span key={item} className="text-sm font-semibold text-foreground bg-primary/5 border border-primary/20 rounded-full px-5 py-2">
                    {item}
                  </span>
                ))}
              </div>

              <p className="text-foreground font-black text-2xl mb-10">Welcome to TradePeaks.</p>

              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-7 text-lg font-semibold shadow-glow transition-all duration-300 hover:shadow-[0_0_50px_hsl(212_98%_62%/0.4)] rounded-xl"
                onClick={onStartClimbing}
              >
                Start Free Trial
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
