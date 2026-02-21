
# Dashboard Layout Redesign

## New Layout Structure

The dashboard will be reorganized into a cleaner, more logical arrangement:

```text
+----------------------------------------------------------+
|  Dream Progress Line Chart (full width)                   |
+----------------------------------------------------------+
|                                    |                      |
|  Trading Calendar                  |  Net P&L             |
|  (with toggles & controls)        |  Trade Win %          |
|                                    |  Profit Factor        |
|                                    |  Day Win %            |
|                                    |  Avg Win/Loss         |
|                                    |                      |
|                                    |  Equity Curve         |
+------------------------------------+----------------------+
```

## What Changes

1. **Top section** -- The MinimalProgressBar (which we'll convert to a line chart per the approved plan) stays at the top, spanning full width. It keeps its "Click to see Vision Mode" interaction.

2. **Left column (Calendar)** -- The Trading Calendar stays exactly where it is, with all its toggles (Pips/P&L, Month, Account) and buttons (Import CSV, Undo Last Import).

3. **Right column (Stats + Equity Curve)** -- The five stat cards (Net P&L, Trade Win %, Profit Factor, Day Win %, Avg Win/Loss) move from the horizontal row above the calendar into the right sidebar, stacked vertically. The Equity Curve stays below them. Risk Management and Strategy Checklist are removed from this page (they can still be accessed elsewhere).

## Technical Details

### File: `src/pages/Dashboard.tsx`

**Remove from layout:**
- `<RiskManagement />` component (lines 440)
- `<StrategyChecklist />` component (lines 441)

**Move DashboardStats into right column:**
- Remove the full-width `DashboardStats` section (lines 316-325) from its current position above the grid
- Place it inside the right column (replacing RiskManagement and StrategyChecklist)

**Update DashboardStats layout:**
- The stats cards currently use `grid-cols-5` (horizontal row). They'll switch to a vertical stack layout for the sidebar.

### File: `src/components/dashboard/DashboardStats.tsx`

- Change the grid from `grid-cols-5` (horizontal) to `grid-cols-1` (vertical stack) so the five stat cards stack neatly in the sidebar
- Each card keeps its gauge/arc visualizations -- they'll just be stacked vertically instead of side-by-side

### File: `src/components/gamification/MinimalProgressBar.tsx`

- Replace the `<Progress>` bar with a compact Recharts `<LineChart>` showing cumulative daily profit over the last 30 days
- Add a horizontal dashed reference line at the dream cost goal
- Use gradient fill under the line for a polished look
- Keep the percentage label and fallback states
- Chart height approximately 80px to stay compact

### Grid adjustment in Dashboard.tsx

The main content grid (`lg:grid-cols-[2fr_1fr]`) stays the same -- the right column will now contain:
1. DashboardStats (5 cards stacked vertically)
2. EquityCurve (below the stats)
