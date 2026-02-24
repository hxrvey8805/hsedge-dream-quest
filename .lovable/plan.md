

## "1% Better Every Day" - Daily Improvement Tracker

### Concept

A system that creates a bridge between yesterday's review and today's trading. After completing a daily review, the trader sets a specific "1% focus" for the next day -- one concrete thing to improve based on their lessons learned. The next day, they rate how well they executed on that focus, building an improvement chain.

### How It Works

1. **New slide in the Daily Review**: A final "Tomorrow's 1% Focus" slide added after "Lessons Learned." The trader writes one specific, actionable improvement commitment (e.g., "Wait for confirmation candle before entering," "Cut position size when trading against trend").

2. **Pre-trade prompt on the Dashboard**: When the trader opens the dashboard, if they have an active 1% focus from their previous review, it appears as a persistent but dismissible banner reminding them of their commitment.

3. **Self-assessment in next review**: When they start the next day's review, the first slide (after Day Summary) shows yesterday's 1% focus and asks them to rate their execution on a 1-5 scale + brief reflection. This rating feeds into a streak/score system.

4. **Streak visualization**: A small "Improvement Streak" indicator on the dashboard or goals page showing consecutive days of rated 3+ execution on their focus.

### Database Changes

A new `daily_improvement_focus` table:

```text
daily_improvement_focus
├── id (uuid, PK)
├── user_id (uuid, NOT NULL)
├── review_date (date, NOT NULL)          -- the review date this was set during
├── focus_text (text, NOT NULL)           -- the 1% commitment
├── execution_rating (integer, NULL)      -- 1-5 self-assessment (filled next day)
├── execution_notes (text, NULL)          -- brief reflection on execution
├── rated_at (timestamp, NULL)            -- when they rated it
├── created_at (timestamp, default now)
├── UNIQUE(user_id, review_date)
```

RLS: standard user_id = auth.uid() policies for all CRUD operations.

### Frontend Changes

1. **New slide component**: `src/components/review/slides/DailyFocusSlide.tsx`
   - Shows yesterday's focus (if exists and unrated) with a 1-5 rating scale and notes field
   - Below that, a text input for setting tomorrow's 1% focus
   - Visual emphasis: large "1%" branding, motivational framing

2. **Update `DailyReviewDialog.tsx`**:
   - Add the new slide as the final slide (after Lessons Learned)
   - Load previous day's unrated focus on dialog open
   - Save both the rating of yesterday's focus and the new focus on review save

3. **Dashboard banner**: `src/components/dashboard/ImprovementFocusBanner.tsx`
   - A subtle card/banner at the top of the dashboard showing today's active 1% focus
   - Shows current improvement streak count
   - Dismissible but reappears on page reload

4. **Streak calculation**: Count consecutive days where the trader rated their execution >= 3 out of 5.

### Technical Details

- The slide fetches the most recent unrated `daily_improvement_focus` row for the user
- On save, it upserts the rating for yesterday's focus and inserts a new row for tomorrow's focus
- The dashboard banner queries for the latest focus where `review_date` equals yesterday (or most recent) and `execution_rating IS NULL`
- Streak is calculated client-side from the last N rows ordered by date descending, counting consecutive ratings >= 3

