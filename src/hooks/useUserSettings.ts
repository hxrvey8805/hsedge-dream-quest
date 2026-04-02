import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  timezone: string;
  currency: string;
  defaultRiskAmount: number | null;
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    currency: "USD",
    defaultRiskAmount: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("timezone, currency, default_risk_amount")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setSettings({
          timezone: profile.timezone || settings.timezone,
          currency: (profile as any).currency || "USD",
          defaultRiskAmount: (profile as any).default_risk_amount ?? null,
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dbUpdates: Record<string, any> = {};
      if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.defaultRiskAmount !== undefined) dbUpdates.default_risk_amount = updates.defaultRiskAmount;

      const { error } = await supabase
        .from("user_profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
