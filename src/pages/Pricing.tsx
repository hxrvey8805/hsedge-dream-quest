import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { toast } from "sonner";
import logo from "@/assets/tp-logo.png";

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const { subscribed, planKey, loading, createCheckout, openCustomerPortal } = useSubscription();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleChoosePlan = async (plan: "monthly" | "yearly") => {
    if (!user) {
      navigate(`/auth?price=${PLANS[plan].price_id}&plan=${plan}`);
      return;
    }
    if (subscribed && planKey === plan) {
      toast.info("You're already on this plan!");
      return;
    }
    setCheckingOut(plan);
    try {
      await createCheckout(PLANS[plan].price_id);
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setCheckingOut(null);
    }
  };

  const features = [
    "All features +",
    "Trading Calendar",
    "Statistics & Analytics",
    "Dream Builder",
    "Achievements & Levels",
    "Goals Tracking",
    "Risk Management",
    "Strategy Checklist",
    "Equity Curve",
    "Log Your Trade",
  ];

  return (
    <div className="min-h-screen bg-[#030712]">
      <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-10 w-10" />
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-white/60 hover:text-white hover:bg-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-500 text-white">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-500 text-white">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">Our Pricing</h1>
          <p className="text-xl text-white/50 mb-4">Sign up now.</p>
          <p className="text-2xl font-bold text-white mb-6">Get used to winning</p>
          <p className="text-lg text-white/50 mb-8">
            Our subscription options give you access to everything that TradePeaks has to offer.
          </p>
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-sm font-semibold text-blue-400">Get 36% Off When You Pay Yearly</span>
            </div>
          </div>
        </div>

        {subscribed && (
          <div className="max-w-md mx-auto mb-10 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Active Subscription</span>
            </div>
            <p className="text-white/60 text-sm mb-3">
              You're on the <span className="text-white font-medium capitalize">{planKey}</span> plan
            </p>
            <Button variant="outline" size="sm" onClick={openCustomerPortal} className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              Manage Subscription
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Yearly Plan */}
          <PlanCard
            name="Yearly"
            price={12}
            interval="/month"
            subtitle="Unlock the full power of TradePeaks with a discount."
            features={features}
            isActive={isYearly}
            isCurrent={subscribed && planKey === "yearly"}
            badge="Best Value"
            loading={checkingOut === "yearly"}
            onHover={() => setIsYearly(true)}
            onChoose={() => handleChoosePlan("yearly")}
          />
          {/* Monthly Plan */}
          <PlanCard
            name="Monthly"
            price={19}
            interval="/month"
            subtitle="Best for users looking to try out the platform."
            features={features}
            isActive={!isYearly}
            isCurrent={subscribed && planKey === "monthly"}
            badge="Popular"
            loading={checkingOut === "monthly"}
            onHover={() => setIsYearly(false)}
            onChoose={() => handleChoosePlan("monthly")}
          />
        </div>
      </main>

      <footer className="border-t border-white/5 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-white/30">
          <p>© {new Date().getFullYear()} TradePeaks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface PlanCardProps {
  name: string;
  price: number;
  interval: string;
  subtitle: string;
  features: string[];
  isActive: boolean;
  isCurrent: boolean;
  badge: string;
  loading: boolean;
  onHover: () => void;
  onChoose: () => void;
}

const PlanCard = ({ name, price, interval, subtitle, features, isActive, isCurrent, badge, loading, onHover, onChoose }: PlanCardProps) => (
  <div
    className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
      isActive
        ? "border-blue-500/50 bg-white/5 backdrop-blur-sm shadow-lg shadow-blue-500/10"
        : "border-white/10 bg-white/[0.02]"
    } relative hover:shadow-xl hover:scale-[1.02]`}
    onMouseEnter={onHover}
  >
    {isCurrent && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1">
        <Crown className="h-3 w-3" /> Your Plan
      </div>
    )}
    {!isCurrent && isActive && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg">
        {badge}
      </div>
    )}
    <div className="mb-6">
      <h3 className="text-2xl font-bold mb-2 text-white">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-blue-400">${price}</span>
        <span className="text-white/50">{interval}</span>
      </div>
      <p className="text-sm text-white/50">{subtitle}</p>
    </div>
    <div className="space-y-3 mb-8">
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="p-1.5 rounded-md bg-blue-500/10">
            <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
          </div>
          <span className="text-sm text-white/70">{feature}</span>
        </div>
      ))}
    </div>
    <Button
      className={`w-full ${
        isCurrent
          ? "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
          : isActive
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
      }`}
      size="lg"
      onClick={onChoose}
      disabled={loading || isCurrent}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
        </span>
      ) : isCurrent ? (
        "Current Plan"
      ) : (
        "Choose the plan"
      )}
    </Button>
  </div>
);

export default Pricing;
