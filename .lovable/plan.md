
# Plan: Replace Landing Page Text with Classic Mountain Theme

## Overview
Replace the current "Trading Journal for Scalpers" content below the hero banner with the classic TradePeaks mountain-themed messaging. This includes the main headline, description, feature cards, and CTA sections.

## Content to Replace

### Current Content (to remove)
- "Trading Journal for Scalpers" eyebrow
- "Track Your Trades. Find Your Edge. Climb Faster." headline
- Scalp trader-focused description
- "Today's Score" card with trading metrics
- Feature pills (Auto-imports, Setup tagging, etc.)
- "Why TradePeaks" section with analytics features

### New Content (from old design)

**Hero Section:**
- Title: "TradePeaks - our Dream-Driven Path to Trading Excellence"
- Description: "Transform your trading journey with TP. Track every trade, build your dreams, and reach the summit with our trading journal."
- Buttons: "Get Started" and "Learn More"

**Feature Cards (3 cards):**
1. **Climb Higher** - "Each trade is a step up the mountain. Track your ascent and reach new peaks."
2. **The Summit Awaits** - "Chart your course to the peaks. Define your destination and map the journey."
3. **Read the Terrain** - "Understand every ridge and valley of your trading journey. See the path clearly."

**Bottom Section:**
- Heading: "But why?"
- Description: "While others stay in the feeding grounds, some traders are drawn to the mountains. Find out what waits at the summit."
- CTA Button: "Start Free Trial Today"

---

## Technical Changes

### File: `src/pages/Index.tsx`

**Lines 147-393** - Replace the entire features and analytics sections with:

1. **Simplified Hero Content Section**
   - Remove motion wrappers and complex animations
   - Simple centered text layout
   - Clean white text styling (no gradients)
   - Two buttons side-by-side: "Get Started" (primary blue) and "Learn More" (outline)

2. **Feature Cards Grid**
   - 3-column responsive grid (1 col mobile, 3 col desktop)
   - Simple Card components with:
     - Title in white
     - Description in white/60
     - Subtle glassmorphism background (bg-white/5)
   - Icons: Mountain, Target/Flag, LineChart (from lucide-react)

3. **"But Why" Section**
   - Centered heading and description
   - Single CTA button: "Start Free Trial Today"
   - Keep floating particles background for visual interest

4. **Styling Approach**
   - Remove gradient text effects
   - Use simple `text-white` and `text-white/60` colors
   - Keep the particle animation background (it's the "blue floating dots" aesthetic)
   - Simpler button styling without hover scale effects
   - Standard Tailwind responsive font sizes

---

## Layout Structure

```text
┌─────────────────────────────────────────────┐
│              Hero Banner Image               │
├─────────────────────────────────────────────┤
│     [Floating Particles Background]          │
│                                              │
│   TradePeaks - Dream-Driven Path to         │
│       Trading Excellence                     │
│                                              │
│   Transform your trading journey...          │
│                                              │
│   [Get Started]  [Learn More]               │
│                                              │
├─────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Climb   │ │  Summit  │ │  Read    │     │
│  │  Higher  │ │  Awaits  │ │  Terrain │     │
│  └──────────┘ └──────────┘ └──────────┘     │
├─────────────────────────────────────────────┤
│              But why?                        │
│                                              │
│   While others stay in the feeding...        │
│                                              │
│      [Start Free Trial Today]               │
├─────────────────────────────────────────────┤
│              © 2026 TradePeaks              │
└─────────────────────────────────────────────┘
```

---

## Icons to Add
Import additional icons from lucide-react:
- `Mountain` - for "Climb Higher" card
- `Target` or `Flag` - for "The Summit Awaits" card  
- `LineChart` or `Eye` - for "Read the Terrain" card

---

## What Stays the Same
- Header with logo, navigation, and login button
- Hero banner image at the top
- Floating particle animation system
- Dark background color (#030712)
- Footer with copyright
- Waitlist dialog functionality
