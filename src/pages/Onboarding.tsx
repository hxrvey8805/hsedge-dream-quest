import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingAccounts } from "@/components/onboarding/OnboardingAccounts";
import { OnboardingVision } from "@/components/onboarding/OnboardingVision";
import { OnboardingVisionBuilder } from "@/components/onboarding/OnboardingVisionBuilder";
import logo from "@/assets/hs-logo.png";

type OnboardingStep = "accounts" | "vision-intro" | "vision-builder";

const Onboarding = () => {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<OnboardingStep>("accounts");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkOnboardingStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkOnboardingStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  };

  const handleAccountsComplete = () => {
    setStep("vision-intro");
  };

  const handleVisionContinue = () => {
    setStep("vision-builder");
  };

  const handleVisionSkip = async () => {
    await completeOnboarding();
  };

  const handleVisionComplete = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    await supabase
      .from("user_profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen lucid-bg relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb w-[600px] h-[600px] bg-primary/20 -top-48 -left-48" />
      <div className="ambient-orb w-[500px] h-[500px] bg-accent/15 -bottom-32 -right-32" style={{ animationDelay: "4s" }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="lucid-particle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 8 + 6}s`,
              animationDelay: `${Math.random() * 4}s`,
              ["--drift-x" as any]: `${(Math.random() - 0.5) * 100}px`,
              ["--drift-y" as any]: `${Math.random() * 80 + 20}px`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="HS-Edge" className="h-12 w-12 animate-logo-float" />
        </div>
      </header>

      {/* Progress indicator */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="flex items-center gap-4">
          {["accounts", "vision-intro", "vision-builder"].map((s, i) => (
            <div key={s} className="flex items-center">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  step === s ? "bg-primary" : 
                  ["accounts", "vision-intro", "vision-builder"].indexOf(step) > i 
                    ? "bg-success" 
                    : "bg-muted"
                }`}
                animate={{ scale: step === s ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              />
              {i < 2 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  ["accounts", "vision-intro", "vision-builder"].indexOf(step) > i 
                    ? "bg-success" 
                    : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {step === "accounts" && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <OnboardingAccounts onComplete={handleAccountsComplete} userId={user?.id} />
            </motion.div>
          )}

          {step === "vision-intro" && (
            <motion.div
              key="vision-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <OnboardingVision onContinue={handleVisionContinue} onSkip={handleVisionSkip} />
            </motion.div>
          )}

          {step === "vision-builder" && (
            <motion.div
              key="vision-builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <OnboardingVisionBuilder onComplete={handleVisionComplete} userId={user?.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Onboarding;
