# BRAND.md — Ironhearth Design System

Working name: **Ironhearth** (pending a formal trademark/business-name check via IP Australia and ASIC before final commit — do not treat as locked).

Concept: a "build your own toolkit" fitness app — the identity leans on a forge/build metaphor (hammer striking anvil) rather than generic fitness imagery.

This file is the single source of truth for visual design. Any UI work should match this system rather than introducing new colors, fonts, or spacing values ad hoc.

## Brand assets (in `/assets/brand/`)
- `icon-1024.png` — master app icon (1024×1024)
- `wordmark.png` — logotype lockup (icon glyph + "IRONHEARTH" text)
- `splash-screen.png` — mobile splash/launch screen composition (1080×1920)
- `palette-reference.png` — visual reference sheet for the core UI colors below

## Tool icons (in `/icons/tools/`)
Every top-level tool/module has a custom bold/geometric icon, replacing the old emoji placeholders. Each icon ships as two transparent PNGs:
- `tool-icon-<name>-default.png` — Text Secondary (`#9B9CA8`) colored, used when the tool is not active/selected
- `tool-icon-<name>-active.png` — Ember Accent (`#FF6B35`) colored, used when the tool is active/selected

`<name>` values (matching MODULES.md's tool list): `workout-logger`, `program-builder`, `exercise-library`, `rest-timer`, `pr-tracker`, `meal-tracker`, `water-tracker`, `recipe-builder`, `body-measurements`, `progress-photos`, `sleep-tracker`, `soreness-rpe-log`, `progress-analytics`, `streaks`, `activity-feed`, `leaderboards`, `achievements`.

`streaks` always renders in Ember Accent-toned flame colors regardless of state (it's a flame icon; the "active" variant is simply a solid brighter version) — every other icon strictly follows the default/active color rule above.

These are raster PNGs, not recolorable SVGs/icon fonts, so swapping the accent color later means regenerating this set — it is not a live CSS variable.

## Color system (UI — use these everywhere in the app)
| Role | Hex | Usage |
|---|---|---|
| Canvas | `#14161C` | App background, full dark theme base |
| Surface | `#1E212B` | Cards, elevated panels, modals — one step lighter than canvas |
| Ember Accent | `#FF6B35` | Primary actions, active states, selected icons, highlights — the ONE accent color, used sparingly and consistently |
| Text Primary | `#F2F1ED` | Main text (off-white, not pure white) |
| Text Secondary | `#9B9CA8` | Secondary/muted text, inactive icons |

Recommended semantic additions (not yet used anywhere, needed for forms/alerts):
| Role | Hex | Usage |
|---|---|---|
| Success | `#4ADE80` | Confirmations, completed states |
| Error | `#FF5C5C` | Validation errors, destructive actions |
| Warning | `#FFD166` | Caution states |

Illustration-only tones (used ONLY in the icon/wordmark/splash artwork itself — never in UI components):
`#8B92A6` steel base · `#B8C0D1` steel highlight · `#545B6B` steel shadow · `#23262E` handle dark · `#3A3F4C` handle highlight · `#454B58` head base · `#6E7688` head highlight · `#0A0B0F` ground shadow · `#FF8A5C` ember light (spark highlight)

## Typography
No custom typeface has been licensed yet. Default to a clean system-first stack until a decision is made:
`font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
(Inter is free/open-source, modern and highly legible at small sizes — safe default, swap later if desired.)

Type scale:
- H1: 28px / 32px line-height, weight 700
- H2: 22px / 26px, weight 700
- H3: 18px / 22px, weight 600
- Body: 16px / 24px, weight 400
- Caption/secondary: 13px / 18px, weight 400

Note: the wordmark artwork itself currently uses Arial Bold as a placeholder. If a different UI typeface is chosen later, the wordmark should be redrawn to match for full consistency.

## Iconography
- Bold/geometric style — no thin decorative line icons.
- Default icon color: Text Secondary (`#9B9CA8`). Switch to Ember Accent (`#FF6B35`) only for the active/selected state — the accent color should stay meaningful, not decorative.
- The 17 top-level tool icons (see "Tool icons" above) are the app's custom icon set — use them instead of emoji or a third-party icon library for anything they cover.
- For anything NOT covered by the tool icon set (e.g. generic UI chrome like a chevron, close button, or search icon), Phosphor Icons "bold" weight or Lucide is an acceptable stopgap until a matching custom icon exists.
- No custom illustrations elsewhere in the app (icon-only direction) — the forge artwork (icon/wordmark/splash) is the one deliberate illustrative exception.

## Spacing
8px base unit. Use the scale: 8, 16, 24, 32, 48px for padding and margins — avoid arbitrary values outside this scale.

## Elevation / Depth
Flat design with one elevation step: Canvas (`#14161C`) → Surface (`#1E212B`). Avoid drop shadows on cards; use the surface color shift alone to indicate elevation, consistent with the flat/geometric mark style.

## Motion
- Standard UI transition: 200ms ease-out.
- Save/complete actions should get a small satisfying confirmation animation (checkmark or scale-pulse) using the Ember Accent color.
- Respect `prefers-reduced-motion` — disable non-essential animation when set.

## States (apply to every interactive component)
Every button, card, and input should define: default, hover, pressed/active, disabled, and loading states. Every list/feed screen that can be empty needs an empty state (icon + short message), not a blank void.

## Voice & tone
Not yet decided — open question for a future pass. Default to plain, encouraging, non-clinical copy in the meantime (e.g. "Nice work — logged." rather than "Entry successfully recorded.").

## Still to build (tracked separately in MODULES.md / IDEAS.md as they're done)
- Small-size legibility pass on the icon (favicon / 16–32px contexts tend to blur out fine detail — test and simplify if needed)
- Small-size legibility pass on the tool icon set too (they were designed at 240px; verify they still read cleanly at typical tab-bar/list sizes, ~24–32px)
- Sport/activity icon set (50+ icons, same bold/geometric treatment as the app icon)
- App store screenshots and Google Play feature graphic (once the UI reflects this system)
