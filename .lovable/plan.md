

## 1% Improvement History & Visualization

### Problem
Currently, when a trader rates their 1% focus below 3 (didn't achieve it), it simply gets recorded and forgotten. There's no way to revisit unachieved focuses, see patterns, or track improvement over time visually.

### Solution
Add a **1% Improvement Journal** section to the Goals page that provides:

1. **Visual timeline/history** of all past 1% focuses with their ratings, color-coded by success (green for 3+, red/amber for below 3)
2. **Carry-forward mechanism** for missed focuses -- unachieved items (rated below 3) get surfaced as suggestions when setting the next day's focus
3. **Progress visualization** with a weekly heatmap and rolling average chart

### Frontend Changes

#### 1. New component: `src/components/goals/ImprovementJournal.tsx`
A dedicated card on the Goals page showing:
- **Heatmap strip**: Last 30 days as colored cells (green = rated 3+, red = rated 1-2, gray = no focus set), similar to a GitHub contribution graph
- **History list**: Scrollable list of recent focuses showing date, focus text, rating (star icons), and execution notes
- **"Unfinished Business" section**: Focuses rated below 3 highlighted with an amber badge, making it easy to re-commit to them
- **Stats row**: Current streak, longest streak, average rating, total focuses set

#### 2. Update `src/pages/Goals.tsx`
- Import and render `ImprovementJournal` as a new section below the existing Habit Tracker
- Full-width layout spanning both columns

#### 3. Update `src/components/review/slides/DailyFocusSlide.tsx`
- When setting tomorrow's focus, show a small "Suggested re-focuses" section listing the most recent unachieved focuses (rated below 3) as clickable chips
- Clicking a chip pre-fills the focus text input, making it easy to re-commit

#### 4. Update `src/components/dashboard/ImprovementFocusBanner.tsx`
- If the previous focus was rated below 3, show a subtle amber indicator: "Yesterday's focus was not fully achieved -- consider re-committing"

### No Database Changes Required
All data already exists in the `daily_improvement_focus` table. The new components simply query and visualize the existing data differently.

### Technical Details
- The heatmap queries the last 30 rows from `daily_improvement_focus` ordered by `review_date` descending
- "Unfinished business" filters for rows where `execution_rating < 3` and `execution_rating IS NOT NULL`, limited to the last 14 days
- Suggested re-focuses on the DailyFocusSlide query the same unachieved set, limited to 3 most recent
- All queries use existing RLS policies (user_id = auth.uid())

