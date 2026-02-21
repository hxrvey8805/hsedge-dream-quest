import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/tp-logo.png";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Statistics", path: "/statistics" },
  { label: "Accounts", path: "/accounts" },
  { label: "Goals", path: "/goals" },
  { label: "Dream Builder", path: "/dream-builder" },
];

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/30 bg-[hsl(222,47%,6%)] sticky top-0 z-50 shrink-0">
        <div className="w-full px-6 py-0 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 py-3">
              <img src={logo} alt="TradePeaks" className="h-8 w-8" />
              <span className="text-lg font-bold text-foreground">TradePeaks</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-sm text-muted-foreground">{userEmail}</span>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/20"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
