import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Settings, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/header-mountains.png";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Statistics", path: "/statistics" },
  { label: "Accounts", path: "/accounts" },
  { label: "Goals", path: "/goals" },
  { label: "Rooms", path: "/rooms" },
  { label: "Dream Builder", path: "/dream-builder" },
  { label: "Playbooks", path: "/playbooks" },
];

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [traderName, setTraderName] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const resolveName = (user: any) => {
      if (!user) return setTraderName(null);
      const meta = (user.user_metadata || {}) as Record<string, any>;
      const name =
        meta.display_name ||
        meta.full_name ||
        meta.name ||
        [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
        (user.email ? user.email.split("@")[0] : null);
      setTraderName(name || null);
    };
    supabase.auth.getUser().then(({ data: { user } }) => resolveName(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveName(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="app-header border-b border-border/30 sticky top-0 z-50 shrink-0">
        <div className="w-full px-8 py-0 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 py-4">
              <img src={logo} alt="TradePeaks" className="h-10 w-10" />
              <span className="text-xl font-bold text-foreground">TradePeaks</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`relative px-5 py-5 text-base font-medium transition-colors ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {traderName && (
              <span className="text-sm text-muted-foreground">{traderName}</span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/20"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/20"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/20"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
      </header>
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full"
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
