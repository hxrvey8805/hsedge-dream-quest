
# Restyle Trade Cards in Selected-Day Dialog

Replace the current trade card layout in `src/components/TradingCalendar.tsx` (view-mode block, ~lines 999–1186) with a structure that matches the uploaded reference.

## New card structure

```text
┌─────────────────────────────────────────────────────────────┐
│ [icon]  XTLB  BUY                                  [ WIN ]  │  ← header row
│         Stocks • May 1, 2026                                │
│                                                             │
│  ENTRY      EXIT       SIZE          ┌───────────────┐      │
│  $4.5000    $4.6100    250.00        │     P&L       │      │  ← metrics row
│                                      │   +$27.50     │      │
│  SESSION    TIMEFRAME  TIME          └───────────────┘      │
│  Premarket  1M         07:11–07:12                          │
│                                                             │
│  (optional notes block below, unchanged styling)            │
└─────────────────────────────────────────────────────────────┘
```

### Visual rules
- Card: `rounded-2xl`, subtle outcome-tinted border (`emerald/20`, `rose/20`, `primary/20`), flat dark fill (`bg-card/40`) — drop the heavy gradient.
- Header row:
  - Square icon tile (`w-11 h-11 rounded-xl`) with outcome-tinted bg + glow ring.
  - Symbol large/bold, BUY/SELL pill inline, asset class + date as muted line below.
  - Outcome pill (WIN/LOSS/BE) pinned top-right with outline + soft glow in outcome color.
  - Action icons (chart, move, edit, delete) appear on hover as a row below the outcome pill.
- Metrics area: 4-column CSS grid where the right column spans both rows and contains a framed "primary metric" tile.
  - Left 3 columns = label/value pairs in two rows: row 1 = Entry / Exit / Size, row 2 = Session / Timeframe / Time.
  - Labels: `text-[10px] uppercase tracking-wider text-muted-foreground`.
  - Values: `text-base font-semibold text-foreground`, monospaced for prices.
  - Primary metric tile: bordered box (`border border-border/60 rounded-xl`), label centered on top (`P&L` or `R:R`), value large (`text-3xl font-bold`), color follows outcome (emerald / rose / foreground).
- Forex/Futures: when Pips/Ticks exist, show as a 4th item in the bottom row (replacing one of the meta cells gracefully, or appended).
- Respect existing view-mode toggle: primary tile shows P&L in $ mode, R:R in R-multiple mode (logic unchanged).
- Notes block kept as-is (top border + muted label).

### What stays the same
- All data, calculations, hover actions, edit flow, delete flow, view-mode logic.
- Outcome color tokens (emerald/rose/primary) and dialog container.

### Files touched
- `src/components/TradingCalendar.tsx` — only the view-mode JSX inside the trades list (~lines 999–1186).

### Out of scope
- Edit-mode form layout.
- Calendar tiles, header, footer summary bar.
- Any data/calculation logic.
