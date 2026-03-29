import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { week_start_date, selected_account_id } = await req.json();
    if (!week_start_date) {
      return new Response(JSON.stringify({ error: "week_start_date required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weekStart = new Date(week_start_date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Mon-Fri

    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

    // Fetch trades
    let tradesQuery = supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("trade_date", startStr)
      .lte("trade_date", endStr)
      .order("trade_date", { ascending: true });

    if (selected_account_id) {
      tradesQuery = tradesQuery.eq("account_id", selected_account_id);
    } else {
      tradesQuery = tradesQuery.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }

    const [tradesRes, reviewsRes, focusRes, gamePlansRes] = await Promise.all([
      tradesQuery,
      supabase
        .from("daily_reviews")
        .select("*")
        .eq("user_id", user.id)
        .gte("review_date", startStr)
        .lte("review_date", endStr),
      supabase
        .from("daily_improvement_focus")
        .select("*")
        .eq("user_id", user.id)
        .gte("review_date", startStr)
        .lte("review_date", endStr),
      supabase
        .from("daily_game_plans")
        .select("*")
        .eq("user_id", user.id)
        .gte("plan_date", startStr)
        .lte("plan_date", endStr),
    ]);

    const trades = tradesRes.data || [];
    const reviews = reviewsRes.data || [];
    const focuses = focusRes.data || [];
    const gamePlans = gamePlansRes.data || [];

    if (trades.length === 0) {
      return new Response(
        JSON.stringify({ error: "No trades found for this week. Log some trades first!" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build stats
    const totalPL = trades.reduce((s, t) => s + (t.pips || 0), 0);
    const totalProfit = trades.reduce((s, t) => s + (t.profit || 0), 0);
    const wins = trades.filter((t) => t.outcome === "Win").length;
    const losses = trades.filter((t) => t.outcome === "Loss").length;
    const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;

    // Best/worst by pips
    const sortedByPips = [...trades].sort((a, b) => (b.pips || 0) - (a.pips || 0));
    const bestTrade = sortedByPips[0];
    const worstTrade = sortedByPips[sortedByPips.length - 1];

    // Day breakdown
    const dayMap: Record<string, { pips: number; profit: number; count: number }> = {};
    for (const t of trades) {
      if (!dayMap[t.trade_date]) dayMap[t.trade_date] = { pips: 0, profit: 0, count: 0 };
      dayMap[t.trade_date].pips += t.pips || 0;
      dayMap[t.trade_date].profit += t.profit || 0;
      dayMap[t.trade_date].count++;
    }
    const days = Object.entries(dayMap).sort((a, b) => b[1].pips - a[1].pips);
    const bestDay = days[0];
    const worstDay = days[days.length - 1];

    const weekStats = {
      totalPips: totalPL,
      totalProfit,
      winRate,
      totalTrades: trades.length,
      wins,
      losses,
      bestDay: bestDay ? { date: bestDay[0], pips: bestDay[1].pips, profit: bestDay[1].profit } : null,
      worstDay: worstDay ? { date: worstDay[0], pips: worstDay[1].pips, profit: worstDay[1].profit } : null,
    };

    // Build prompt
    const tradesStr = trades
      .map(
        (t) =>
          `- ${t.trade_date} | ${t.pair || t.symbol || "N/A"} | ${t.buy_sell} | ${t.outcome} | ${t.pips ?? 0} pips | $${t.profit ?? 0} | R:R ${t.risk_reward_ratio || "N/A"} | Session: ${t.session || "N/A"} | Notes: ${t.notes || "none"}`
      )
      .join("\n");

    const reviewsStr = reviews
      .map(
        (r) =>
          `- ${r.review_date}: Well: ${r.what_went_well || "N/A"} | Lessons: ${r.lessons_learned || "N/A"} | Missed: ${r.missed_opportunities || "N/A"}`
      )
      .join("\n");

    const focusStr = focuses
      .map(
        (f) =>
          `- ${f.review_date}: Focus: ${f.focus_text} | Rating: ${f.execution_rating ?? "N/A"}/5 | Notes: ${f.execution_notes || "N/A"}`
      )
      .join("\n");

    const gamePlansStr = gamePlans
      .map(
        (g) =>
          `- ${g.plan_date}: Bias: ${g.market_bias || "N/A"} | Watchlist: ${g.watchlist || "N/A"} | Levels: ${g.key_levels || "N/A"}`
      )
      .join("\n");

    const prompt = `You are an elite trading performance coach analyzing a trader's weekly performance. Based on the data below, provide a comprehensive weekend review.

WEEK: ${startStr} to ${endStr}
STATS: ${trades.length} trades, ${wins}W/${losses}L, ${winRate}% win rate, ${totalPL} pips, $${totalProfit} profit

TRADES:
${tradesStr || "No trades"}

DAILY REVIEWS:
${reviewsStr || "No reviews"}

1% IMPROVEMENT FOCUS:
${focusStr || "No focus entries"}

GAME PLANS:
${gamePlansStr || "No game plans"}

Provide your analysis in these exact sections. Be specific, reference actual trades/data, and be constructive:

BEST TRADE ANALYSIS:
Identify the best trade of the week and explain WHY it was the best (execution quality, setup, risk management, patience). Reference the specific trade details.

WORST TRADE ANALYSIS:
Identify the worst trade and explain what went wrong. Extract the key lesson. Be constructive, not harsh.

PATTERNS & INSIGHTS:
Identify 2-3 recurring patterns from the week's data — both positive habits to reinforce and areas needing work. Reference specific reflections or focus areas the trader mentioned.

NEXT WEEK GAME PLAN:
Based on this week's performance, suggest 3-4 specific, actionable focus areas for next week. Include what to keep doing, what to stop doing, and what to start doing.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert trading performance analyst. Provide clear, actionable insights." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "weekend_review",
              description: "Structure the weekend review analysis",
              parameters: {
                type: "object",
                properties: {
                  best_trade_analysis: { type: "string", description: "Analysis of the best trade" },
                  worst_trade_analysis: { type: "string", description: "Analysis of the worst trade" },
                  patterns_insights: { type: "string", description: "Patterns and insights from the week" },
                  next_week_plan: { type: "string", description: "Game plan for next week" },
                },
                required: ["best_trade_analysis", "worst_trade_analysis", "patterns_insights", "next_week_plan"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "weekend_review" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let analysis: any;

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        analysis = JSON.parse(toolCall.function.arguments);
      } else {
        // Fallback: parse from content
        const content = aiData.choices?.[0]?.message?.content || "";
        analysis = {
          best_trade_analysis: content,
          worst_trade_analysis: "",
          patterns_insights: "",
          next_week_plan: "",
        };
      }
    } catch {
      const content = aiData.choices?.[0]?.message?.content || "Analysis could not be parsed.";
      analysis = {
        best_trade_analysis: content,
        worst_trade_analysis: "",
        patterns_insights: "",
        next_week_plan: "",
      };
    }

    // Upsert into weekly_reviews
    const { data: upsertData, error: upsertError } = await supabase
      .from("weekly_reviews")
      .upsert(
        {
          user_id: user.id,
          week_start_date: startStr,
          week_stats: weekStats,
          best_trade_id: bestTrade?.id || null,
          best_trade_analysis: analysis.best_trade_analysis,
          worst_trade_id: worstTrade?.id || null,
          worst_trade_analysis: analysis.worst_trade_analysis,
          patterns_insights: analysis.patterns_insights,
          next_week_plan: analysis.next_week_plan,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_start_date" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to save review" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(upsertData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
