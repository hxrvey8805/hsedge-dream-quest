import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserStats {
  totalTrades: number;
  winningTrades: number;
  totalProfit: number;
  totalPips: number;
  maxSingleTradePips: number;
  winRate: number;
  consecutiveWins: number;
  lastTradeDate: string | null;
  currentStreak: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Checking achievements for user:', user.id);

    // Fetch user's trades
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false });

    if (!trades || trades.length === 0) {
      return new Response(JSON.stringify({ message: 'No trades found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate user stats
    const stats: UserStats = {
      totalTrades: trades.length,
      winningTrades: trades.filter(t => t.outcome === 'Win').length,
      totalProfit: trades.reduce((sum, t) => sum + (t.profit || 0), 0),
      totalPips: trades.reduce((sum, t) => sum + (t.pips || 0), 0),
      maxSingleTradePips: Math.max(...trades.map(t => Math.abs(t.pips || 0))),
      winRate: 0,
      consecutiveWins: 0,
      lastTradeDate: trades[0]?.trade_date || null,
      currentStreak: 0,
    };

    stats.winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;

    // Calculate consecutive wins (current streak)
    let currentWinStreak = 0;
    for (const trade of trades) {
      if (trade.outcome === 'Win') {
        currentWinStreak++;
      } else {
        break;
      }
    }
    stats.consecutiveWins = currentWinStreak;

    // Calculate trading streak (consecutive days)
    const uniqueDates = [...new Set(trades.map(t => t.trade_date))].sort().reverse();
    let currentDayStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const tradeDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((today.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        currentDayStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const dateDiff = Math.floor((prevDate.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateDiff === 1) {
          currentDayStreak++;
        } else {
          break;
        }
      }
    }
    stats.currentStreak = currentDayStreak;

    console.log('User stats:', stats);

    // Fetch all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    if (!achievements) {
      throw new Error('Failed to fetch achievements');
    }

    // Fetch user's current achievement progress
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    const existingAchievements = new Map(
      userAchievements?.map(ua => [ua.achievement_id, ua]) || []
    );

    const newlyUnlocked: any[] = [];
    let totalXPGained = 0;

    // Check each achievement
    for (const achievement of achievements) {
      const existing = existingAchievements.get(achievement.id);
      
      // Skip if already unlocked
      if (existing?.unlocked_at) continue;

      let currentProgress = 0;
      let shouldUnlock = false;

      // Determine progress based on requirement type
      switch (achievement.requirement_type) {
        case 'total_trades':
          currentProgress = stats.totalTrades;
          shouldUnlock = stats.totalTrades >= achievement.requirement_value;
          break;
        case 'winning_trades':
          currentProgress = stats.winningTrades;
          shouldUnlock = stats.winningTrades >= achievement.requirement_value;
          break;
        case 'total_profit':
          currentProgress = Math.floor(stats.totalProfit);
          shouldUnlock = stats.totalProfit >= achievement.requirement_value;
          break;
        case 'single_trade_pips':
          currentProgress = Math.floor(stats.maxSingleTradePips);
          shouldUnlock = stats.maxSingleTradePips >= achievement.requirement_value;
          break;
        case 'win_streak':
          currentProgress = stats.consecutiveWins;
          shouldUnlock = stats.consecutiveWins >= achievement.requirement_value;
          break;
        case 'consecutive_days':
          currentProgress = stats.currentStreak;
          shouldUnlock = stats.currentStreak >= achievement.requirement_value;
          break;
        case 'win_rate_with_min':
          const minTrades = achievement.requirement_value === 50 ? 20 : 
                           achievement.requirement_value === 60 ? 50 : 100;
          currentProgress = Math.floor(stats.winRate);
          shouldUnlock = stats.totalTrades >= minTrades && stats.winRate >= achievement.requirement_value;
          break;
        case 'monthly_trades':
          // Count trades in current month
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthTrades = trades.filter(t => new Date(t.trade_date) >= monthStart).length;
          currentProgress = monthTrades;
          shouldUnlock = monthTrades >= achievement.requirement_value;
          break;
      }

      // Update or insert achievement progress
      if (shouldUnlock) {
        await supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: currentProgress,
            unlocked_at: new Date().toISOString(),
          });

        newlyUnlocked.push(achievement);
        totalXPGained += achievement.xp_reward;
        console.log(`Unlocked achievement: ${achievement.name}`);
      } else if (currentProgress > (existing?.progress || 0)) {
        await supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: currentProgress,
            unlocked_at: null,
          });
      }
    }

    // Update user profile with new XP and level
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const newXP = profile.experience_points + totalXPGained;
      const newAchievementCount = profile.total_achievements_unlocked + newlyUnlocked.length;
      
      // Calculate new level
      let newLevel = profile.level;
      let xpForNextLevel = getXPForLevel(newLevel);
      
      while (newXP >= xpForNextLevel) {
        newLevel++;
        xpForNextLevel = getXPForLevel(newLevel);
      }

      const leveledUp = newLevel > profile.level;

      await supabase
        .from('user_profiles')
        .update({
          experience_points: newXP,
          level: newLevel,
          total_achievements_unlocked: newAchievementCount,
          current_streak_days: stats.currentStreak,
          longest_streak: Math.max(profile.longest_streak, stats.currentStreak),
          last_trade_date: stats.lastTradeDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      console.log(`Updated profile: XP ${newXP}, Level ${newLevel}`);

      return new Response(JSON.stringify({
        newlyUnlocked,
        totalXPGained,
        leveledUp,
        newLevel,
        stats,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Profile not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error checking achievements:', err);
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getXPForLevel(level: number): number {
  if (level <= 5) return level * 100;
  if (level <= 10) return 500 + ((level - 5) * 250);
  if (level <= 20) return 1750 + ((level - 10) * 500);
  if (level <= 30) return 6750 + ((level - 20) * 1000);
  return 16750 + ((level - 30) * 2000);
}
