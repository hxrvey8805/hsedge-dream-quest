import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import * as LucideIcons from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_value: number;
  xp_reward: number;
  badge_color: string;
}

interface UserAchievement {
  achievement_id: string;
  progress: number;
  unlocked_at: string | null;
}

export const AchievementsPanel = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .order("xp_reward", { ascending: true });

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // Fetch user's achievement progress
      const { data: userAchievementsData } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

      if (userAchievementsData) {
        setUserAchievements(userAchievementsData);
      }
    };

    fetchData();

    // Subscribe to achievement changes
    const channel = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements'
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = userAchievements.filter(ua => ua.unlocked_at).length;

  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Trophy;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} of {achievements.length} unlocked
          </p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="streak">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const userAchievement = getUserAchievement(achievement.id);
              const isUnlocked = userAchievement?.unlocked_at;
              const progress = userAchievement?.progress || 0;
              const progressPercent = (progress / achievement.requirement_value) * 100;

              return (
                <Card
                  key={achievement.id}
                  className={`p-4 ${
                    isUnlocked 
                      ? "bg-gradient-to-br from-card to-primary/5 border-primary/20" 
                      : "bg-card/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: isUnlocked ? `${achievement.badge_color}20` : 'hsl(var(--muted))',
                        color: isUnlocked ? achievement.badge_color : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      {renderIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{achievement.name}</h3>
                        {isUnlocked && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            +{achievement.xp_reward} XP
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      
                      {!isUnlocked && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {progress}/{achievement.requirement_value}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-1" />
                        </div>
                      )}
                      
                      {isUnlocked && (
                        <p className="text-xs text-primary mt-2">
                          ✓ Unlocked {new Date(userAchievement.unlocked_at!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
