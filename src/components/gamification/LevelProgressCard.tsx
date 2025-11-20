import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";

interface UserProfile {
  level: number;
  experience_points: number;
  total_achievements_unlocked: number;
  current_streak_days: number;
}

const getLevelTitle = (level: number): string => {
  if (level <= 5) return "Beginner Trader";
  if (level <= 10) return "Developing Trader";
  if (level <= 20) return "Skilled Trader";
  if (level <= 30) return "Expert Trader";
  return "Master Trader";
};

const getLevelColor = (level: number): string => {
  if (level <= 5) return "#CD7F32";
  if (level <= 10) return "#C0C0C0";
  if (level <= 20) return "#FFD700";
  if (level <= 30) return "#E5E4E2";
  return "#B9F2FF";
};

const getXPForLevel = (level: number): number => {
  if (level <= 5) return 100;
  if (level <= 10) return 250;
  if (level <= 20) return 500;
  if (level <= 30) return 1000;
  return 2000;
};

export const LevelProgressCard = () => {
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
  const progressPercent = (currentLevelXP / totalXPNeeded) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-full" 
            style={{ backgroundColor: `${getLevelColor(profile.level)}20` }}
          >
            <Star 
              className="h-6 w-6" 
              style={{ color: getLevelColor(profile.level) }}
              fill={getLevelColor(profile.level)}
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Level {profile.level}</h3>
            <p className="text-sm text-muted-foreground">{getLevelTitle(profile.level)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">{profile.experience_points} XP</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {xpForCurrentLevel - profile.experience_points} XP to next level
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{profile.current_streak_days}</p>
          <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{profile.total_achievements_unlocked}</p>
          <p className="text-xs text-muted-foreground">Achievements 🏆</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">+{currentLevelXP}</p>
          <p className="text-xs text-muted-foreground">Level XP ⭐</p>
        </div>
      </div>
    </Card>
  );
};
