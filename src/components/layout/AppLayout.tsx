import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Trophy,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/tp-logo.png";

export const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10 shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">TradePeaks</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/statistics")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Statistics
            </Button>
            <Button variant="ghost" onClick={() => navigate("/accounts")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Accounts
            </Button>
            <Button variant="ghost" onClick={() => navigate("/goals")}>
              <Trophy className="mr-2 h-4 w-4" />
              Goals
            </Button>
            <Button variant="ghost" onClick={() => navigate("/dream-builder")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Dream Builder
            </Button>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
