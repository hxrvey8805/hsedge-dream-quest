import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MonthlyRiskOverrides } from "@/lib/rMultiple";

export interface UserSettings {
  timezone: string;
  currency: string;
  defaultRiskAmount: number | null;
  monthlyRiskOverrides: MonthlyRiskOverrides;
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    currency: "USD",
    defaultRiskAmount: null,
    monthlyRiskOverrides: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("timezone, currency, default_risk_amount, monthly_risk_overrides")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setSettings({
          timezone: profile.timezone || settings.timezone,
          currency: (profile as any).currency || "USD",
          defaultRiskAmount: (profile as any).default_risk_amount ?? null,
          monthlyRiskOverrides: ((profile as any).monthly_risk_overrides as MonthlyRiskOverrides) || {},
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const handler = () => fetchSettings();
    window.addEventListener("user-settings-updated", handler);
    return () => window.removeEventListener("user-settings-updated", handler);
  }, []);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dbUpdates: Record<string, any> = {};
      if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.defaultRiskAmount !== undefined) dbUpdates.default_risk_amount = updates.defaultRiskAmount;
      if (updates.monthlyRiskOverrides !== undefined) dbUpdates.monthly_risk_overrides = updates.monthlyRiskOverrides;

      const { error } = await supabase
        .from("user_profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      window.dispatchEvent(new CustomEvent("user-settings-updated"));
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
