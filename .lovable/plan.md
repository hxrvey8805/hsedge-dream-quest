
# Plan: Match Landing Page to Preview Exactly

## Understanding
The 3 background images (`background1.png`, `background2.png`, `background3.png`) ARE the preview split into 3 vertical sections. They already contain:
- The large glowing "TP" logo
- The moon and mountains
- All visual styling

The task is to:
1. Stack these 3 images vertically as a continuous background
2. Remove all the current text/content that duplicates what's in the images
3. Overlay ONLY the interactive elements (nav links, buttons, waitlist dialog, card) in the correct positions

## Changes

### 1. Simplify Background Structure
Replace the current complex background layering with a simple vertical stack of the 3 images:
- `background1.png` - Hero section (TP logo, moon, mountains, headline text)
- `background2.png` - Mid section 
- `background3.png` - Bottom section

Use `background-size: 100% auto` (not `cover`) so images display at their natural aspect ratio without cropping/zooming.

### 2. Remove Duplicate Content
Since the background images already contain the text, remove:
- The `<h1>` headline ("Track Your Trades...")
- The subheadline ("Climb Faster")
- The body paragraph text
- The header "TradePeaks" wordmark (keep only the small logo icon)

### 3. Header Changes
- Remove the "TradePeaks" text next to logo
- Keep nav links: Features, Analysis, Why TradePeaks, Pricing
- Keep "Join Waitlist" button
- Make header fully transparent (no background)
- Reduce spacing/font sizes to match preview

### 4. Hero Section
- Remove all text elements (they're in the background image)
- Position only the two buttons ("Start Free" and "Your Dashboard") to overlay where they appear in the preview
- Keep the "Today's Score" card but adjust its position/size to match preview

### 5. Keep Interactive Elements
The following remain as overlays:
- Header navigation links (clickable)
- "Start Free" and "Your Dashboard" buttons
- "Today's Score" card
- Waitlist dialog functionality
- Particles (optional, can keep for interactivity)

### 6. Remove Lower Sections
Remove the Features, Analysis, Why TradePeaks, System steps, and Bottom CTA sections since they're now part of the background images. Keep only the footer.

---

## Technical Implementation

**File: `src/pages/Index.tsx`**

```text
Background approach:
- Create a single scrollable container
- Stack bg1, bg2, bg3 as <img> elements (not CSS backgrounds) for precise sizing
- Set images to width: 100%, height: auto
- Overlay interactive elements with absolute/fixed positioning
```

**Header:**
- Remove `<span>TradePeaks</span>`
- Reduce nav gap from `gap-6` to `gap-4`
- Smaller text: `text-xs` instead of `text-sm`

**Hero section:**
- Remove h1, p tags
- Keep only buttons + card as positioned overlays

**Interactive overlay positioning:**
- Buttons positioned ~60-65% down from top of first image
- Card positioned to the right on desktop, below on mobile
