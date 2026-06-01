# Icons

SignalFlow uses **[Lucide](https://lucide.dev)** as its icon system, the same set the
production app imports (`lucide-react`). There are no bespoke icon files to ship, so
this folder is intentionally a reference, not an asset dump.

## Usage

- **In the app (React):** `lucide-react`, e.g. `import { Radar } from "lucide-react"`.
- **In static prototypes / these UI kits:** Lucide via CDN,
  `https://unpkg.com/lucide@latest`, then `lucide.createIcons()`.
- Stroke icons, ~1.75 to 2px stroke, rounded caps/joins, 24px grid.
- Render at 16 to 20px in-app, in slate (`--fg-2` / `--fg-3`) or a brand-tinted tile.

## The icon-tile motif

The recurring pattern is a Lucide glyph inside a 40px, 10px-radius tile with a ~10 to
15% tinted background and matching stroke color, toned to status (blue / green /
amber / red). See `preview-cards/brand/brand-icon-tiles.html`.

## Frequently used glyphs

`Radio` (brand), `Radar` (command center), `Bell` (signals), `BrainCircuit`
(intelligence), `Sparkles` (AI), `ShieldCheck` / `ShieldAlert` (consent / policy),
`GitBranch` (action graph), `Workflow` (orchestration), `PhoneCall` (voice), `Target`
(opportunities), `Users` (customers), `Gauge` (executive insights), `Plug`
(providers), `ClipboardCheck` (review queue), `Banknote`, `ArrowRight`.

**No emoji or unicode glyphs are used as icons, ever.**
