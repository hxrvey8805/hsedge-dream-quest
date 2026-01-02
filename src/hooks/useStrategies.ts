import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Strategy {
  id: string;
  name: string;
}

export const useStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStrategies = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await (supabase
      .from("strategies")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true }) as any);

    if (!error && data) {
      setStrategies(data as Strategy[]);
    }
    setLoading(false);
  }, []);

  const deleteStrategy = async (strategyId: string) => {
    const { error } = await supabase
      .from("strategies")
      .update({ is_active: false })
      .eq("id", strategyId);

    if (error) {
      toast.error("Failed to delete strategy");
      return false;
    }

    toast.success("Strategy deleted");
    return true;
  };

  const addStrategy = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("strategies" as any)
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to add strategy: ${error.message || "Unknown error"}`);
      return null;
    }

    toast.success("Strategy added!");
    return data as unknown as Strategy;
  };

  useEffect(() => {
    fetchStrategies();

    // Subscribe to realtime changes on strategies table
    const channel = supabase
      .channel('strategies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'strategies',
        },
        () => {
          fetchStrategies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStrategies]);

  return {
    strategies,
    loading,
    fetchStrategies,
    deleteStrategy,
    addStrategy,
  };
};
