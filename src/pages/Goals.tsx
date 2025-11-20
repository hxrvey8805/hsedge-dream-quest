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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Goals & Progress
            </h1>
            <p className="text-muted-foreground mt-1">Track your trading journey and achievements</p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Goals;
