import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { week_start_date, selected_account_id } = await req.json();
    if (!week_start_date) {
      return new Response(JSON.stringify({ error: "week_start_date required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already generated
    const { data: existing } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("week_start_date", week_start_date)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weekStart = new Date(week_start_date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

    let tradesQuery = supabase
      .from("trades").select("*").eq("user_id", user.id)
      .gte("trade_date", startStr).lte("trade_date", endStr)
      .order("trade_date", { ascending: true });

    if (selected_account_id) {
      tradesQuery = tradesQuery.eq("account_id", selected_account_id);
    } else {
      tradesQuery = tradesQuery.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }

    const [tradesRes, reviewsRes, focusRes, gamePlansRes, slidesRes] = await Promise.all([
      tradesQuery,
      supabase.from("daily_reviews").select("*").eq("user_id", user.id)
        .gte("review_date", startStr).lte("review_date", endStr),
      supabase.from("daily_improvement_focus").select("*").eq("user_id", user.id)
        .gte("review_date", startStr).lte("review_date", endStr),
      supabase.from("daily_game_plans").select("*").eq("user_id", user.id)
        .gte("plan_date", startStr).lte("plan_date", endStr),
      // Fetch trade review slides for screenshots
      supabase.from("trade_review_slides").select("trade_id, screenshot_url, screenshot_slots, markers, reflection")
        .eq("user_id", user.id),
    ]);

    const trades = tradesRes.data || [];
    const reviews = reviewsRes.data || [];
    const focuses = focusRes.data || [];
    const gamePlans = gamePlansRes.data || [];
    const allSlides = slidesRes.data || [];

    if (trades.length === 0) {
      return new Response(
        JSON.stringify({ error: "No trades found for this week." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build slide lookup by trade_id - aggregate ALL slides per trade
    const slidesByTradeId: Record<string, any[]> = {};
    for (const s of allSlides) {
      if (s.trade_id) {
        if (!slidesByTradeId[s.trade_id]) slidesByTradeId[s.trade_id] = [];
        slidesByTradeId[s.trade_id].push(s);
      }
    }

    // Stats
    const totalPips = trades.reduce((s, t) => s + (t.pips || 0), 0);
    const totalProfit = trades.reduce((s, t) => s + (t.profit || 0), 0);
    const wins = trades.filter(t => t.outcome === "Win").length;
    const losses = trades.filter(t => t.outcome === "Loss").length;
    const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;

    const sortedByPips = [...trades].sort((a, b) => (b.pips || 0) - (a.pips || 0));
    const bestTrade = sortedByPips[0];
    const worstTrade = sortedByPips[sortedByPips.length - 1];

    const dayMap: Record<string, { pips: number; profit: number; count: number }> = {};
    for (const t of trades) {
      if (!dayMap[t.trade_date]) dayMap[t.trade_date] = { pips: 0, profit: 0, count: 0 };
      dayMap[t.trade_date].pips += t.pips || 0;
      dayMap[t.trade_date].profit += t.profit || 0;
      dayMap[t.trade_date].count++;
    }
    const days = Object.entries(dayMap).sort((a, b) => b[1].pips - a[1].pips);

    // Get screenshot data for best/worst trades - collect from all slides
    const bestSlides = bestTrade ? (slidesByTradeId[bestTrade.id] || []) : [];
    const worstSlides = worstTrade ? (slidesByTradeId[worstTrade.id] || []) : [];

    // Aggregate all screenshot slots and reflections from all slides for a trade
    const aggregateSlideData = (slides: any[]) => {
      const allSlots: any[] = [];
      const allMarkers: any[] = [];
      const reflections: string[] = [];
      let mainScreenshot: string | null = null;

      for (const slide of slides) {
        if (slide.screenshot_url) mainScreenshot = slide.screenshot_url;
        if (slide.markers) allMarkers.push(...(Array.isArray(slide.markers) ? slide.markers : []));
        if (slide.reflection) reflections.push(slide.reflection);
        if (slide.screenshot_slots && Array.isArray(slide.screenshot_slots)) {
          allSlots.push(...slide.screenshot_slots);
        }
      }

      return {
        screenshot_slots: allSlots,
        markers: allMarkers,
        screenshot_url: mainScreenshot,
        reflection: reflections.join("\n\n") || null,
      };
    };

    const bestData = aggregateSlideData(bestSlides);
    const worstData = aggregateSlideData(worstSlides);

    // Also include trade screenshots from the trades table itself
    const buildTradeDetail = (trade: any, slideData: any) => ({
      id: trade.id, symbol: trade.symbol || trade.pair, pips: trade.pips,
      profit: trade.profit, outcome: trade.outcome, buy_sell: trade.buy_sell,
      risk_reward_ratio: trade.risk_reward_ratio, trade_date: trade.trade_date,
      entry_price: trade.entry_price, exit_price: trade.exit_price,
      time_opened: trade.time_opened, time_closed: trade.time_closed,
      session: trade.session, notes: trade.notes,
      screenshots: trade.screenshots || [],
      screenshot_slots: slideData.screenshot_slots,
      markers: slideData.markers,
      screenshot_url: slideData.screenshot_url,
      reflection: slideData.reflection,
    });

    const weekStats = {
      totalPips, totalProfit, winRate, totalTrades: trades.length, wins, losses,
      bestDay: days[0] ? { date: days[0][0], pips: days[0][1].pips, profit: days[0][1].profit } : null,
      worstDay: days.length > 1 ? { date: days[days.length-1][0], pips: days[days.length-1][1].pips, profit: days[days.length-1][1].profit } : null,
      bestTrade: bestTrade ? buildTradeDetail(bestTrade, bestData) : null,
      worstTrade: worstTrade ? buildTradeDetail(worstTrade, worstData) : null,
    };

    // Build prompt
    const tradesStr = trades.map(t =>
      `- ${t.trade_date} | ${t.pair || t.symbol || "N/A"} | ${t.buy_sell} | ${t.outcome} | ${t.pips ?? 0} pips | $${t.profit ?? 0} | R:R ${t.risk_reward_ratio || "N/A"} | Session: ${t.session || "N/A"} | Notes: ${t.notes || "none"}`
    ).join("\n");

    const reviewsStr = reviews.map(r =>
      `- ${r.review_date}: Well: ${r.what_went_well || "N/A"} | Lessons: ${r.lessons_learned || "N/A"} | Missed: ${r.missed_opportunities || "N/A"}`
    ).join("\n");

    const focusStr = focuses.map(f =>
      `- ${f.review_date}: Focus: ${f.focus_text} | Rating: ${f.execution_rating ?? "N/A"}/5 | Notes: ${f.execution_notes || "N/A"}`
    ).join("\n");

    // Include reflections from trade slides
    const reflectionsStr = trades.map(t => {
      const slide = slidesByTradeId[t.id];
      if (slide?.reflection) {
        return `- ${t.trade_date} ${t.symbol || t.pair}: "${slide.reflection}"`;
      }
      return null;
    }).filter(Boolean).join("\n");

    const prompt = `You are an elite trading performance coach. Analyze this trader's week.

WEEK: ${startStr} to ${endStr}
STATS: ${trades.length} trades, ${wins}W/${losses}L, ${winRate}% win rate, ${totalPips.toFixed(1)} pips, $${totalProfit.toFixed(2)} profit

TRADES:
${tradesStr}

DAILY REVIEWS:
${reviewsStr || "None"}

1% IMPROVEMENT FOCUS:
${focusStr || "None"}

TRADE REFLECTIONS (from review slides):
${reflectionsStr || "None"}

Provide analysis for each section. Be specific, reference actual trades and reflections. Keep each section 2-4 sentences. Be constructive and actionable.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          { role: "system", content: "You are an expert trading coach. Concise, actionable insights." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "weekend_review",
            description: "Structure the weekend review",
            parameters: {
              type: "object",
              properties: {
                best_trade_analysis: { type: "string" },
                worst_trade_analysis: { type: "string" },
                patterns_insights: { type: "string" },
                next_week_plan: { type: "string" },
              },
              required: ["best_trade_analysis", "worst_trade_analysis", "patterns_insights", "next_week_plan"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "weekend_review" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI error:", status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    let analysis: any;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      analysis = toolCall ? JSON.parse(toolCall.function.arguments) : {
        best_trade_analysis: aiData.choices?.[0]?.message?.content || "",
        worst_trade_analysis: "", patterns_insights: "", next_week_plan: "",
      };
    } catch {
      analysis = {
        best_trade_analysis: aiData.choices?.[0]?.message?.content || "Analysis unavailable.",
        worst_trade_analysis: "", patterns_insights: "", next_week_plan: "",
      };
    }

    const { data: insertData, error: insertError } = await supabase
      .from("weekly_reviews")
      .insert({
        user_id: user.id,
        week_start_date: startStr,
        week_stats: weekStats,
        best_trade_id: bestTrade?.id || null,
        best_trade_analysis: analysis.best_trade_analysis,
        worst_trade_id: worstTrade?.id || null,
        worst_trade_analysis: analysis.worst_trade_analysis,
        patterns_insights: analysis.patterns_insights,
        next_week_plan: analysis.next_week_plan,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save review" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(insertData), {
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
