import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface UserProfile {
  level: number;
  experience_points: number;
}

const getXPForLevel = (level: number): number => {
  if (level <= 5) return 100;
  if (level <= 10) return 250;
  if (level <= 20) return 500;
  if (level <= 30) return 1000;
  return 2000;
};

export const MinimalProgressBar = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        () => fetchProfile()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!profile) return null;

  const xpForCurrentLevel = getXPForLevel(profile.level);
  const xpForPreviousLevel = profile.level === 1 ? 0 : getXPForLevel(profile.level - 1);
  const totalXPNeeded = xpForCurrentLevel - xpForPreviousLevel;
  const currentLevelXP = profile.experience_points - xpForPreviousLevel;
  const progressPercent = Math.min((currentLevelXP / totalXPNeeded) * 100, 100);
  const xpForNextLevel = getXPForLevel(profile.level + 1);
  const xpNeededForNextLevel = Math.max(0, xpForNextLevel - profile.experience_points);

  return (
    <div className="w-full max-w-md mx-auto space-y-2 mb-8">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Level {profile.level}</span>
        <span className="font-semibold text-primary">{Math.round(progressPercent)}%</span>
      </div>
      <Progress 
        value={progressPercent} 
        className="h-2 bg-muted/50"
      />
      <p className="text-xs text-center text-muted-foreground">
        {xpNeededForNextLevel} XP to Level {profile.level + 1}
      </p>
    </div>
  );
};

