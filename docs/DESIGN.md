# Pitz Products — Design System ("Obsidian")

The design handoff for the product-management UI. It documents the tokens and
component decisions implemented in `frontend/src/index.css` and the feature
components, so the look can be reasoned about and extended without guesswork.

## 1. Brand foundation

Pitz is an automotive brand — **red on deep navy**. The UI leans into that: a
dark, faintly-violet-navy ground (premium SaaS, à la Linear/Vercel) with the
Pitz red reserved for brand + primary actions. A persistent navy app-bar carries
the Pitz lockup in **both** themes, so the product is recognizably Pitz whether
the user runs light or dark.

- **Primary / brand** — Pitz red. Primary CTAs, active toggles, focus rings, links.
- **Navy** — the app-bar and the dark theme's base surfaces.
- **Neutral scale** — navy-tinted grays for text, borders, muted surfaces.
- **Semantic** — emerald `success`, amber `warning` (these drive stock health),
  red `destructive` (a deeper crimson, kept distinct from the brand red).

Dark is the default vibe; light is fully supported.

## 2. Color tokens (OKLCH)

Defined as CSS custom properties and exposed to Tailwind v4 via `@theme inline`.
OKLCH keeps lightness perceptually even across hue, so tints stay legible.

| Role | Light | Dark |
|------|-------|------|
| `background` | `0.99 0.004 255` | `0.185 0.024 258` |
| `foreground` | `0.24 0.03 258` (navy ink) | `0.972 0.005 255` |
| `card` | `1 0 0` | `0.225 0.026 258` |
| `primary` (Pitz red) | `0.575 0.223 27` | `0.63 0.225 27` |
| `muted-foreground` | `0.505 0.02 258` | `0.705 0.02 255` |
| `border` | `0.9 0.006 255` | `1 0 0 / 9%` (hairline) |
| `success` | `0.585 0.14 155` | `0.72 0.16 158` |
| `warning` | `0.68 0.15 65` | `0.79 0.15 72` |
| `destructive` | `0.545 0.216 20` | `0.62 0.21 20` |
| `brand-navy` (app-bar) | `0.195 0.033 258` | `0.195 0.033 258` |

`ring` = primary in both themes, so keyboard focus reads as a red brand glow.

## 3. Typography

- **Geist Variable** — UI sans. Headings use `tracking-tight` + semibold.
- **Geist Mono Variable** — SKUs and any code-like identifier, shown in a subtle
  chip so IDs are scannable without dominating.
- Numerics (price, stock, counts, pagination) use `tabular-nums` so columns align.

## 4. Surfaces & elevation

- **Radius** — `--radius: 0.7rem`; cards/containers use `rounded-xl`.
- **Hairline borders** (`border/9%` in dark) carry structure; shadows stay soft.
- **Brand aurora** — a faint fixed radial of the primary red anchored top-center
  for depth, low enough opacity to keep text legible.
- Primary buttons carry a subtle `shadow-primary/25` lift that grows on hover.

## 5. Motion

Restrained. `transition-colors`/`transition` at ~200ms on interactive elements;
list results fade + slide-in on load (`animate-in`); primary button nudges on
`:active`. No decorative animation.

## 6. Components

- **App-bar** — navy, sticky, `backdrop-blur`; a `dark` island so the outline
  mode-toggle stays legible on navy in either theme. Red logo tile + `Pitz`
  wordmark + `Products`.
- **Page header** — `Products` H1 + a live count subtitle ("57 products in your
  catalog", or "…matching" when filtered) + the red **New product** CTA.
- **Toolbar** — search (debounced 400 ms, spinner while fetching) + status filter
  + the **view toggle** (segmented, active segment in Pitz red).
- **Table view** — uppercase muted headers on a tinted row; SKU mono chips;
  right-aligned tabular price/stock; **stock intelligence** (0 → red "out",
  ≤5 → amber "low"); status-dot pills; hover-reveal row actions.
- **Grid view** — responsive 1→2→3→4 columns of product cards (echoing the Pitz
  storefront): branded media band + status badge, SKU chip, name, bold price,
  stock health, hover-reveal actions.
- **States** — skeleton mirrors the table shell; empty + error states share a
  tonal icon medallion (neutral vs destructive).
- **Dialogs** — create/edit form + a destructive confirm for (soft) delete.

## 7. Views & persistence

The list renders as a **table** (dense, default — safest first impression) or a
**card grid** (visual, storefront-like). The choice persists in `localStorage`
(`pitz.view-mode`), guarded so it degrades to in-memory state where storage is
unavailable (private mode, some test envs). On mobile the table view falls back
to a single-column card list; the grid view is responsive at every breakpoint.

## 8. Accessibility

- Focus is always visible (red ring, `outline-ring/50` base).
- The view toggle uses real `<button aria-pressed>` semantics; every row/card
  action has an explicit `aria-label` (e.g. `Edit {name}`).
- Status is conveyed by **dot + text**, not color alone.
- Contrast targets WCAG AA for body text in both themes.

## 9. Swapping the real logo

The header currently renders a `Package` tile + `Pitz` wordmark. To use the
official mark, drop `logo.svg` into `frontend/public/` and replace the tile in
`src/App.tsx` with `<img src="/logo.svg" … />` — nothing else depends on it.
