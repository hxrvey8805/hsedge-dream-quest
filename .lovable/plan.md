

# Weekend Review — AI-Powered Weekly Recap & Prep

## Overview

A "Weekend Review" card placed below the Trading Calendar on the dashboard. It uses AI (Lovable AI / Gemini Flash) to automatically analyze the previous week's trades, daily reflections, lessons learned, and 1% focus entries — then generates a structured summary with best/worst trade highlights, patterns, and a suggested plan for the coming week.

## How It Works

1. **Placement**: A new `WeekendReviewCard` component rendered below the calendar card inside the left column of the dashboard layout.

2. **Data Collection** (all automatic, no user input needed):
   - Fetch all trades from Mon–Fri of the current/previous week
   - Fetch daily reviews (what went well, lessons learned, missed opportunities)
   - Fetch daily improvement focus entries + execution ratings
   - Fetch game plans for context

3. **AI Generation**: Send the aggregated data to a new edge function (`generate-weekend-review`) that calls Gemini 2.5 Flash via Lovable AI to produce:
   - **Week Stats Summary** — total P&L, win rate, trade count, best/worst day
   - **Best Trade** — which trade and why (based on R:R, execution, reflection)
   - **Worst Trade** — which trade and why, with the lesson extracted
   - **Patterns & Insights** — recurring themes from reflections/lessons
   - **Next Week Game Plan** — suggested focus areas, habits to reinforce, setups to watch

4. **Persistence**: Save generated reviews to a new `weekly_reviews` table so users can revisit past weeks without re-generating.

5. **UI**: A sleek card with sections for each AI output block. A "Generate Review" button for first-time, then shows the cached review. Option to regenerate.

## Technical Plan

### 1. Database Migration
New `weekly_reviews` table:
- `id`, `user_id`, `week_start_date` (Monday), `week_stats` (jsonb), `best_trade_id`, `best_trade_analysis` (text), `worst_trade_id`, `worst_trade_analysis` (text), `patterns_insights` (text), `next_week_plan` (text), `created_at`, `updated_at`
- RLS: users own their reviews
- Unique constraint on (user_id, week_start_date)

### 2. Edge Function — `generate-weekend-review`
- Receives user_id and week_start date
- Queries trades, daily_reviews, daily_improvement_focus for that week
- Constructs a prompt with all the data
- Calls Gemini 2.5 Flash via Lovable AI gateway
- Returns structured JSON with all sections
- Upserts into `weekly_reviews`

### 3. New Component — `WeekendReviewCard`
- Placed below the calendar card on Dashboard
- On mount: checks if a review exists for the current week
- If exists: renders the cached review in styled sections
- If not: shows a "Generate Weekend Review" button
- Shows a loading state with skeleton while AI processes
- Sections: Week Stats (mini cards), Best Trade (green highlight), Worst Trade (red highlight), Patterns, Next Week Plan

### 4. Dashboard Integration
- Import and render `WeekendReviewCard` below the calendar `Card` in `Dashboard.tsx`
- Pass `selectedAccount` and `refreshTrigger` as props

### Files to Create/Edit
- **Create**: `supabase/migrations/weekly_reviews.sql`
- **Create**: `supabase/functions/generate-weekend-review/index.ts`
- **Create**: `src/components/dashboard/WeekendReviewCard.tsx`
- **Edit**: `src/pages/Dashboard.tsx` — add the card below the calendar

