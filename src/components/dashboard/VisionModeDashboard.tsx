import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { Home, Car, Plane, Sparkles, TrendingUp, Target, Check, Clock, X, Quote } from "lucide-react";

// ─── Unchanged logic ──────────────────────────────────────────────────────────

const parseTimescaleToMs = (timescale: string | null, createdAt: string): number | null => {
  if (!timescale) return null;
  const lower = timescale.toLowerCase();
  let years = 0, months = 0;
  const yearMatch = lower.match(/(\d+)\s*year/);
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (yearMatch) years = parseInt(yearMatch[1]);
  if (monthMatch) months = parseInt(monthMatch[1]);
  if (years === 0 && months === 0) {
    if (lower.includes("1") && lower.includes("year")) years = 1;
    else if (lower.includes("2") && lower.includes("year")) years = 2;
    else if (lower.includes("3") && lower.includes("year")) years = 3;
    else if (lower.includes("5") && lower.includes("year")) years = 5;
    else if (lower.includes("10") && lower.includes("year")) years = 10;
    else return null;
  }
  const created = new Date(createdAt);
  const deadline = new Date(created);
  deadline.setFullYear(deadline.getFullYear() + years);
  deadline.setMonth(deadline.getMonth() + months);
  return deadline.getTime();
};

const useCountdown = (deadlineMs: number | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadlineMs) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadlineMs]);
  if (!deadlineMs) return null;
  const diff = deadlineMs - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, totalDays: days, expired: false };
};

interface VisionModeDashboardProps {
  onClose: () => void;
}

interface DreamData {
  profile: any;
  purchases: any[];
  incomeSources: any[];
  monthlyProfit: number;
}

// ─── Circular progress ring ───────────────────────────────────────────────────

function CircularProgress({ percent, color }: { percent: number; color: string }) {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const motionVal = useMotionValue(circumference);
  const strokeDashoffset = useTransform(motionVal, v => v);

  useEffect(() => {
    const target = circumference * (1 - Math.min(100, percent) / 100);
    const controls = animate(motionVal, target, { duration: 1.6, ease: "easeOut" });
    return controls.stop;
  }, [percent, circumference]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />
        {/* Progress */}
        <motion.circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          filter={`drop-shadow(0 0 8px ${color})`}
        />
      </svg>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tabular-nums" style={{ color, textShadow: `0 0 20px ${color}60` }}>
          {percent.toFixed(0)}%
        </span>
        <span className="text-xs text-white/40 uppercase tracking-widest mt-1">covered</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const VisionModeDashboard = ({ onClose }: VisionModeDashboardProps) => {
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [loading, setLoading] = useState(true);

  // Unchanged data fetching
  useEffect(() => { fetchDreamData(); }, []);

  const fetchDreamData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("user_profiles").select("primary_dream_id").eq("user_id", user.id).single();
    if (!profile?.primary_dream_id) { setLoading(false); return; }
    const { data: dreamProfile } = await supabase
      .from("dream_profiles").select("*").eq("id", profile.primary_dream_id).single();
    const { data: purchases } = await supabase
      .from("dream_purchases").select("*").eq("dream_profile_id", profile.primary_dream_id);
    const { data: incomeSources } = await supabase
      .from("trading_income_sources").select("*").eq("dream_profile_id", profile.primary_dream_id);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: trades } = await supabase
      .from("trades").select("profit, trade_date").eq("user_id", user.id)
      .gte("trade_date", thirtyDaysAgo.toISOString().split("T")[0]);
    const monthlyProfit = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;
    setDreamData({ profile: dreamProfile, purchases: purchases || [], incomeSources: incomeSources || [], monthlyProfit });
    setLoading(false);
  };

  const calculateMonthlyCost = (purchase: any) => {
    const downPayment = purchase.down_payment || 0;
    const taxBuffer = purchase.tax_interest_buffer || 0;
    const years = purchase.payment_period_years || 1;
    const remaining = purchase.price - downPayment;
    const withBuffer = remaining * (1 + taxBuffer / 100);
    return withBuffer / (years * 12);
  };

  const deadlineMs = useMemo(() => {
    if (!dreamData?.profile) return null;
    return parseTimescaleToMs(dreamData.profile.timescale, dreamData.profile.created_at);
  }, [dreamData?.profile]);

  const countdown = useCountdown(deadlineMs);

  // ── Particles (same pattern as LucidAnimation) ─────────────────────────────
  const particles = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    delay: Math.random() * 4,
    duration: 14 + Math.random() * 18,
    opacity: 0.2 + Math.random() * 0.4,
  })), []);

  // ── Orb config ─────────────────────────────────────────────────────────────
  const orbs = [
    { color: "139, 92, 246",  size: 600, top: "-15%", left: "-10%", delay: 0,   dur: 18 },
    { color: "16, 185, 129",  size: 500, top: "50%",  right: "-8%", delay: 3,   dur: 22 },
    { color: "59, 130, 246",  size: 400, top: "30%",  left: "40%",  delay: 6,   dur: 26 },
  ];

  // ── Colour helpers ─────────────────────────────────────────────────────────
  const getProgressColor = (pct: number): string => {
    if (pct >= 100) return "#10b981";
    if (pct >= 75)  return "#34d399";
    if (pct >= 50)  return "#f59e0b";
    if (pct >= 25)  return "#f97316";
    return "#ef4444";
  };

  const getTimerColor = () => {
    if (!countdown || countdown.expired) return "#ef4444";
    if (countdown.totalDays < 30)  return "#ef4444";
    if (countdown.totalDays < 90)  return "#f59e0b";
    return "#8b5cf6";
  };

  const getCategoryIcon = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes("house") || l.includes("home") || l.includes("apartment")) return Home;
    if (l.includes("car") || l.includes("vehicle")) return Car;
    if (l.includes("travel") || l.includes("trip") || l.includes("vacation")) return Plane;
    return Sparkles;
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-violet-400 text-lg font-medium tracking-widest uppercase"
        >
          Loading your vision...
        </motion.div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!dreamData?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 rounded-3xl border border-white/10 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Sparkles className="w-14 h-14 text-violet-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-2">No Vision Created Yet</h2>
          <p className="text-white/40 mb-6">Create your dream vision in the Dream Builder to unlock this view.</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const selectedPurchases = dreamData.purchases.filter(p => p.is_selected);
  const totalMonthlyCost = selectedPurchases.reduce((sum, p) => sum + calculateMonthlyCost(p), 0);
  const coveragePercent = totalMonthlyCost > 0
    ? Math.min(100, (dreamData.monthlyProfit / totalMonthlyCost) * 100)
    : 0;
  const ringColor = getProgressColor(coveragePercent);
  const timerColor = getTimerColor();

  const lifeAspects = [
    { key: "living_situation", label: "Living Situation", icon: Home,     grad: "from-violet-500/20" },
    { key: "vehicle",          label: "Dream Vehicle",   icon: Car,      grad: "from-emerald-500/20" },
    { key: "travel",           label: "Travel Goals",    icon: Plane,    grad: "from-amber-500/20"   },
    { key: "style",            label: "Lifestyle",       icon: Sparkles, grad: "from-pink-500/20"    },
  ].filter(a => !!dreamData.profile[a.key]);

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#050508" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Ambient orbs ───────────────────────────────────────────────────── */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: "left" in orb ? (orb as any).left : undefined,
            right: "right" in orb ? (orb as any).right : undefined,
            background: `radial-gradient(circle, rgba(${orb.color}, 0.18) 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{ y: [0, -40, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Particles ──────────────────────────────────────────────────────── */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Close button ───────────────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onClose}
        className="fixed top-5 right-6 z-50 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur text-white/50 hover:text-white transition-all"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14 space-y-16">

        {/* ── Hero Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-5"
        >
          {/* WHY quote */}
          {dreamData.profile.why_motivation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start justify-center gap-3 max-w-2xl mx-auto"
            >
              <Quote className="w-6 h-6 text-violet-400/60 shrink-0 mt-1" />
              <p className="text-lg italic text-white/50 leading-relaxed text-left">
                {dreamData.profile.why_motivation}
              </p>
            </motion.div>
          )}

          {/* Label */}
          <p className="text-xs uppercase tracking-[0.3em] text-violet-400/70 font-medium">
            {dreamData.profile.timescale || "Your future reality"}
          </p>

          {/* Title */}
          <h1
            className="text-5xl md:text-7xl font-black text-white leading-tight"
            style={{ textShadow: "0 0 60px rgba(139,92,246,0.35)" }}
          >
            {dreamData.profile.title}
          </h1>

          {/* Countdown */}
          {countdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-1 px-6 py-4 rounded-2xl border backdrop-blur-xl mt-4"
              style={{
                borderColor: `${timerColor}40`,
                background: `${timerColor}0d`,
                boxShadow: `0 0 30px ${timerColor}20`,
              }}
            >
              {countdown.expired ? (
                <span className="font-bold text-lg" style={{ color: timerColor }}>Deadline Passed</span>
              ) : (
                <>
                  {[
                    { val: countdown.days,    label: "Days" },
                    { val: countdown.hours,   label: "Hrs"  },
                    { val: countdown.minutes, label: "Min"  },
                    { val: countdown.seconds, label: "Sec"  },
                  ].map((seg, i) => (
                    <div key={seg.label} className="flex items-center gap-1">
                      {i > 0 && <span className="text-2xl font-thin mx-1" style={{ color: `${timerColor}80` }}>:</span>}
                      <div className="text-center min-w-[48px]">
                        <motion.div
                          key={seg.val}
                          initial={{ scale: 1.08 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-3xl font-black tabular-nums"
                          style={{ color: timerColor, textShadow: `0 0 12px ${timerColor}60` }}
                        >
                          {String(seg.val).padStart(2, "0")}
                        </motion.div>
                        <p className="text-[9px] uppercase tracking-widest text-white/30 mt-0.5">{seg.label}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ── Progress Hero ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="rounded-3xl border border-white/10 backdrop-blur-xl p-10"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Ring */}
            <div className="shrink-0">
              <CircularProgress percent={coveragePercent} color={ringColor} />
            </div>

            {/* Stat cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {[
                {
                  icon: TrendingUp,
                  label: "Monthly Trading Profit",
                  value: `$${dreamData.monthlyProfit.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  color: "#10b981",
                },
                {
                  icon: Target,
                  label: "Required Monthly Income",
                  value: `$${totalMonthlyCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  color: "#8b5cf6",
                },
                {
                  icon: coveragePercent >= 100 ? Check : Clock,
                  label: "Status",
                  value: coveragePercent >= 100
                    ? "Dream Achievable!"
                    : `$${(totalMonthlyCost - dreamData.monthlyProfit).toFixed(0)} more/mo`,
                  color: coveragePercent >= 100 ? "#10b981" : "#f59e0b",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/8 backdrop-blur"
                  style={{ background: `${stat.color}0d`, borderColor: `${stat.color}25` }}
                >
                  <stat.icon className="w-5 h-5 mb-3" style={{ color: stat.color }} />
                  <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Dream Item Cards ────────────────────────────────────────────────── */}
        {selectedPurchases.length > 0 && (
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-white mb-6"
            >
              Dream Items
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedPurchases.map((purchase, idx) => {
                const monthlyCost = calculateMonthlyCost(purchase);
                const itemCoverage = dreamData.monthlyProfit > 0
                  ? Math.min(100, (dreamData.monthlyProfit / monthlyCost) * 100)
                  : 0;
                const coverColor = getProgressColor(itemCoverage);
                const Icon = getCategoryIcon(purchase.item_name);

                return (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.08, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 group cursor-default"
                    style={{
                      background: purchase.image_url
                        ? undefined
                        : "rgba(255,255,255,0.04)",
                      minHeight: 220,
                      boxShadow: `0 0 0 0 ${coverColor}00`,
                      transition: "box-shadow 0.3s",
                    }}
                  >
                    {/* Background image */}
                    {purchase.image_url && (
                      <>
                        <img
                          src={purchase.image_url}
                          alt={purchase.item_name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                      </>
                    )}

                    {/* No-image placeholder */}
                    {!purchase.image_url && (
                      <div
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 30% 50%, ${coverColor}18 0%, transparent 70%)` }}
                      />
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-5 h-full flex flex-col justify-end" style={{ minHeight: 220 }}>
                      {/* Top: icon (no-image only) */}
                      {!purchase.image_url && (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-auto"
                          style={{ background: `${coverColor}25`, color: coverColor }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      )}

                      {/* Badge */}
                      {itemCoverage >= 100 && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Bottom info */}
                      <div className="mt-auto">
                        <h3 className="font-bold text-white text-lg leading-tight">{purchase.item_name}</h3>
                        <p className="text-white/50 text-sm mb-3">${purchase.price.toLocaleString()}</p>

                        {/* Progress bar */}
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: coverColor, boxShadow: `0 0 6px ${coverColor}` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${itemCoverage}%` }}
                            transition={{ delay: 0.9 + idx * 0.08, duration: 1.2, ease: "easeOut" }}
                          />
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">${monthlyCost.toFixed(0)}/mo needed</span>
                          <span className="font-semibold" style={{ color: coverColor }}>
                            {itemCoverage.toFixed(0)}% covered
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Dream Life Aspects ──────────────────────────────────────────────── */}
        {lifeAspects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Dream Life</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {lifeAspects.map((aspect, i) => (
                <motion.div
                  key={aspect.key}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className={`p-6 rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br ${aspect.grad} to-transparent`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <aspect.icon className="w-5 h-5 text-white/60" />
                    <h4 className="font-semibold text-white/80 text-sm uppercase tracking-wider">{aspect.label}</h4>
                  </div>
                  <p className="text-white/60 leading-relaxed">{dreamData.profile[aspect.key]}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Empty purchases state ───────────────────────────────────────────── */}
        {selectedPurchases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-16 rounded-3xl border border-white/8"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/30">No dream purchases selected. Add items in the Dream Builder.</p>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};
