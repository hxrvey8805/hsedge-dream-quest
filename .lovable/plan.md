
# Redesign Dashboard Header to Match Reference Style

## Overview
Redesign the header on the Dashboard page (and AppLayout) to match the sleek, dark reference image style -- with the TradePeaks logo and name on the left, navigation links inline next to it, and user controls on the right side.

## Design Details

**Left Side:**
- TradePeaks logo icon + "TradePeaks" text
- Navigation links inline: Dashboard, Statistics, Accounts, Goals, Dream Builder
- Active link gets a blue underline indicator (like "Dashboard" in the reference)

**Right Side:**
- User avatar/icon with user name/email
- Sign Out button (minimal icon style)

**Styling:**
- Dark background matching the reference (dark navy/card background)
- Navigation links as plain text (no ghost buttons), with subtle hover and active underline
- Compact, single-line layout
- Sticky at top

## Technical Changes

### 1. Update `src/pages/Dashboard.tsx` (header section, ~lines 293-322)
- Replace the current `<Button variant="ghost">` navigation with styled text links
- Add active state detection using current route
- Add underline indicator for active nav item
- Move Sign Out to right side as an icon-only button
- Add user display (avatar icon + name) on the right
- Remove icons from nav links for cleaner look matching reference

### 2. Update `src/components/layout/AppLayout.tsx`
- Apply the same header redesign for consistency across pages that use AppLayout
- Use `useLocation()` to detect active route and apply underline styling

### Style Approach
- Nav links: `text-sm font-medium text-white/60 hover:text-white transition-colors` with active state `text-white` + bottom border
- Header: darker background with `bg-[#0a0e1a]` or similar dark navy
- Underline: `border-b-2 border-blue-500` on active item
- Compact padding: `py-3` instead of `py-4`
