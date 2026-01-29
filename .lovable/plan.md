
# Twin Peaks Inspired Homepage Redesign

## Overview
Transform the homepage background into a nostalgic, dreamy Twin Peaks-inspired scene with moody mountains and a prominent moon that draws users into the experience.

## Visual Design Concept
The Twin Peaks aesthetic is defined by:
- Misty, layered mountain silhouettes with depth
- A large, glowing moon partially behind the peaks
- Warm/cool color contrast (deep teals, magentas, warm golden moon)
- Atmospheric mist/fog between mountain layers
- Subtle pine tree silhouettes along ridges
- Mysterious, inviting atmosphere

---

## Implementation Details

### 1. Add a Glowing Moon
**Position:** Upper portion of the background, partially obscured by the tallest peak
- Large circular moon with soft glow effect
- Warm golden/cream color for nostalgic feel
- Multiple layered glow rings for dreamy atmosphere
- Subtle animation to pulse gently

### 2. Redesign Mountain Silhouettes
**Replace current SVG with layered Twin Peaks style:**
- **Far background:** Distant, hazy mountain range (very low opacity)
- **Mid layer:** Rolling hills with pine tree silhouettes
- **Hero twin peaks:** Two prominent peaks side by side (the signature look)
- **Foreground:** Dark ridge with pine tree outlines

**Color palette shift:**
- Deep navy/indigo base (`#0a1628`)
- Teal-blue mid tones for mountains
- Subtle magenta/purple hints in shadows
- Moon glow casting warm highlights on peak edges

### 3. Add Atmospheric Elements
- **Mist layers:** Horizontal gradient bands between mountain layers
- **Pine tree silhouettes:** Small triangular trees along ridges
- **Star field:** Sparse, twinkling stars above the moon (fewer than current particles)

### 4. CSS Animations
Add new keyframe animations in `src/index.css`:
- `moon-glow`: Subtle pulsing glow effect for the moon
- `mist-drift`: Slow horizontal movement for mist layers

---

## Technical Changes

### File: `src/pages/Index.tsx`
- Redesign the SVG mountain section with:
  - Moon element with radial gradient and glow
  - Multi-layered mountain paths with Twin Peaks silhouette
  - Pine tree details along ridges
  - Mist gradient overlays
- Reduce particle count and make them behave more like distant stars
- Adjust overall color scheme to warmer/moodier tones

### File: `src/index.css`
- Add `moon-glow` keyframe animation
- Add `mist-drift` keyframe animation
- Create `.moon` and `.mist-layer` utility classes

---

## Visual Result
The homepage will evoke the feeling of standing at the edge of a mysterious forest at twilight, looking toward twin mountain peaks with a full moon rising behind them - inviting users to begin their journey to the summit.
