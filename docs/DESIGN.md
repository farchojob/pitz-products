# Pitz Products — Design System ("Obsidian v2")

The design system for the product-management UI, implemented in
`frontend/src/index.css` + the feature components. v2 adds product imagery, a
quick-view modal, catalog metrics and a tick-meter stock indicator on top of the
v1 Pitz brand (red on deep navy).

## 1. Brand foundation

Pitz is an automotive brand — **red on deep navy**. A persistent navy app-bar
carries the official Pitz wordmark in **both** themes (a `dark` island), so the
product is recognizably Pitz whether the user runs light or dark. Pitz red is
reserved for brand + primary actions; a faint red speed-line sits under the bar.

- **Primary / brand** — Pitz red. CTAs, active toggles, focus rings.
- **Navy** — the app-bar and the dark theme's base surfaces.
- **Semantic** — emerald `success` (healthy stock / active), amber `warning`
  (low stock), red `destructive` (out of stock / delete — a deeper crimson).

Dark is the default; light is fully supported.

## 2. Color tokens (OKLCH)

CSS custom properties exposed to Tailwind v4 via `@theme inline`. OKLCH keeps
lightness perceptually even across hue, so tints stay legible.

| Role | Light | Dark |
|------|-------|------|
| `background` | `0.985 0.004 255` | `0.17 0.026 260` |
| `foreground` | `0.24 0.03 258` (navy ink) | `0.972 0.005 255` |
| `card` | `1 0 0` | `0.212 0.028 259` |
| `popover` | `1 0 0` | `0.235 0.03 259` |
| `primary` (Pitz red) | `0.575 0.223 27` | `0.63 0.225 27` |
| `muted-foreground` | `0.5 0.02 258` | `0.71 0.02 255` |
| `border` | `0.905 0.006 255` | `1 0 0 / 8%` (hairline) |
| `input-bg` | `0.978 0.004 255` | `1 0 0 / 4%` |
| `success` | `0.585 0.14 155` | `0.72 0.16 158` |
| `warning` | `0.62 0.14 65` | `0.79 0.15 72` |
| `destructive` | `0.545 0.216 20` | `0.62 0.21 20` |
| `thumb-bg` (image wells) | `0.955 0.008 255` | `0.28 0.03 259` |
| `tick-off` (empty meter) | `0 0 0 / 9%` | `1 0 0 / 10%` |
| `brand-navy` (app-bar) | `0.19 0.033 258` | `0.19 0.033 258` |

`ring` = primary in both themes, so keyboard focus reads as a red brand glow.

## 3. Typography

- **Geist Variable** — UI sans; headings use `tracking-tight` + semibold.
- **Geist Mono Variable** — SKUs, column headers, eyebrows, meter chips.
- Numerics (price, stock, counts) use `tabular-nums` so columns align.

## 4. Signature elements

- **Product imagery** — `image_url` on every product; a `<ProductThumb>` renders
  the image with a designed **no-media fallback** (package glyph in a `thumb-bg`
  well) in the table (44px), grid (media band) and quick view. Uploaded via a
  browse/drag-drop field to the API's local folder.
- **Stock meter** — a 10-tick health bar (`filled = clamp(round(stock/250·10),
  1, 10)`; 0 = none) coloured by health + an `OUT`/`LOW` chip, everywhere stock
  appears. Encodes quantity *and* health at a glance.
- **Metrics strip** — 4 KPI cards from `GET /products/stats` (Total SKUs, Active
  with a progress bar, Stock alerts, compact Inventory value).
- **Quick view** — row/card click opens a split read-modal (image left, facts +
  Edit/Delete right); two-step nav beats inline crowding.

## 5. Motion

150–400 ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`; dialogs scale-in; list results
fade + rise; cards lift ≤2px on hover; `prefers-reduced-motion` is honored.

## 6. Components

- **App-bar** — navy, sticky, `backdrop-blur`, `dark` island; official Pitz
  wordmark (`public/logo.png`) + mono `PRODUCTS` + a red speed-line underneath.
- **Page header** — `CATALOG` eyebrow (mono red) + large title + live count +
  the red **New product** pill CTA.
- **Toolbar** — pill search (debounced 400 ms + spinner), pill status filter, and
  a labeled Grid/Table segmented toggle (active segment in Pitz red).
- **Table view** — mono uppercase headers; 44px thumbnail + name + description;
  mono SKU; tabular price; `<StockMeter>` column; status-dot pills; row click →
  quick view; hover-reveal actions.
- **Grid view** — horizontal spec cards (92px thumb + SKU/status, name, price +
  meter), responsive `1→2→3` columns, whole card → quick view.
- **Form dialog** — image upload zone (browse + drop + preview + Change/Remove)
  above the fields; inline zod errors mirroring the API.
- **States** — skeleton mirrors the layout; empty + error share a tonal medallion.

## 7. Views & persistence

The list renders as a **table** (dense, default) or a **card grid** (visual).
The choice persists in `localStorage` (`pitz.view-mode`), guarded so it degrades
to in-memory where storage is unavailable. Below ~800px the table view falls
back to a single-column card list; the grid is responsive at every breakpoint.

## 8. Accessibility

- Focus always visible (red ring). View toggle + quick-view triggers use real
  button semantics (`aria-pressed`, `role="button"` + keyboard handlers).
- Every row/card action has an explicit `aria-label` (e.g. `Edit {name}`); the
  stock meter carries an `aria-label` and its ticks are `aria-hidden`.
- Status is conveyed by **dot + text**, not colour alone. Body text targets AA.

## 9. Logo

The app-bar renders `public/logo.png` (the official Pitz wordmark, transparent
PNG) via `<img src="/logo.png">` in `src/App.tsx`. To update the mark, replace
that file — no code change. (Provenance from the Claude Design handoff bundle.)
