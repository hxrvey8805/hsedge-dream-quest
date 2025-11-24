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
  const progressPercent = Math.min((currentLevelXP / totalXPNeeded) * 100, 100);
  const xpForNextLevel = getXPForLevel(profile.level + 1);
  const xpNeededForNextLevel = Math.max(0, xpForNextLevel - profile.experience_points);

  return (
    <Card className="p-8 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm border-primary/10 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="relative p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: `${getLevelColor(profile.level)}15`,
              border: `2px solid ${getLevelColor(profile.level)}30`
            }}
          >
            <Star 
              className="h-8 w-8" 
              style={{ color: getLevelColor(profile.level) }}
              fill={getLevelColor(profile.level)}
            />
            <div 
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: getLevelColor(profile.level) }}
            >
              {profile.level}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getLevelTitle(profile.level)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Level {profile.level} Trader</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">{profile.experience_points}</span>
            <span className="text-sm font-medium text-muted-foreground">XP</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            {xpNeededForNextLevel} XP to Level {profile.level + 1}
          </p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-sm font-semibold text-foreground">Level Progress</span>
          <span className="text-lg font-bold text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <div className="relative">
          <Progress 
            value={progressPercent} 
            className="h-3 bg-muted/50"
          />
          <div 
            className="absolute inset-0 rounded-full opacity-20 blur-sm"
            style={{ 
              background: `linear-gradient(90deg, ${getLevelColor(profile.level)} 0%, transparent 100%)`
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-md group">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">
            {profile.current_streak_days}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
            <span>🔥</span>
            <span>Day Streak</span>
          </div>
        </div>
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-md group">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">
            {profile.total_achievements_unlocked}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
            <span>🏆</span>
            <span>Achievements</span>
          </div>
        </div>
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-md group">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">
            {currentLevelXP}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
            <span>⭐</span>
            <span>Level XP</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
