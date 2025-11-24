import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GoalsChecklist } from "@/components/goals/GoalsChecklist";
import { PropFirmTracker } from "@/components/goals/PropFirmTracker";
import { FundedAccounts } from "@/components/goals/FundedAccounts";
import { Evaluations } from "@/components/goals/Evaluations";
import { MilestonesTracker } from "@/components/gamification/MilestonesTracker";
import logo from "@/assets/hs-logo.png";

const Goals = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GoalsChecklist />
          <MilestonesTracker />
        </div>

        <div className="mb-6">
          <PropFirmTracker />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FundedAccounts />
          <Evaluations />
        </div>
      </main>
    </div>
  );
};

export default Goals;
