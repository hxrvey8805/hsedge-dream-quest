import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

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
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm shadow-lg">
        {/* Electric glow effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-30 blur-xl"
          style={{
            background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progressPercent}%, transparent ${progressPercent}%)`
          }}
        />
        
        <div className="relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary animate-pulse" fill="currentColor" />
              <span className="text-sm font-semibold text-foreground">Level {profile.level}</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {Math.round(progressPercent)}%
            </span>
          </div>
          
          {/* Custom progress bar with electric effect */}
          <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden border border-primary/10">
            <div 
              className="absolute inset-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) 50%, 
                  hsl(var(--primary)) 100%)`,
                boxShadow: `0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))`,
              }}
            >
              {/* Animated shine effect */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.4) 50%, 
                    transparent 100%)`,
                  animation: 'shimmer 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground font-medium">
            {xpNeededForNextLevel} XP to Level {profile.level + 1}
          </p>
        </div>
      </div>
    </div>
  );
};

