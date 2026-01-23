import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectBrowserTimezone } from "@/lib/sessionDetection";

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>(detectBrowserTimezone());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("timezone")
          .eq("user_id", user.id)
          .single();

        if (profile?.timezone) {
          setTimezone(profile.timezone);
        }
      } catch (error) {
        console.error("Error fetching timezone:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimezone();
  }, []);

  const updateTimezone = async (newTimezone: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("user_profiles")
        .update({ timezone: newTimezone })
        .eq("user_id", user.id);

      if (error) throw error;
      
      setTimezone(newTimezone);
      return true;
    } catch (error) {
      console.error("Error updating timezone:", error);
      return false;
    }
  };

  return { timezone, loading, updateTimezone };
}
