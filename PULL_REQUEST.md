# Build light enterprise design system for SignalFlow

> Branch: `design/light-enterprise-system` → base: `main`
> **Do not merge directly into main. Open as a reviewable pull request.**

## Summary

- Adds the light enterprise SignalFlow design system
- Adds brand tokens, typography, spacing, radii, shadows, and component styling
- Adds the updated marketing homepage direction
- Adds ambient scroll fade background treatment
- Adds app and marketing UI kit surfaces
- Preserves deterministic demo-safe product framing
- Keeps `#2563EB` as the primary blue
- Keeps Geist and Geist Mono as the typography direction
- Uses navy accents selectively for command-center depth

## What's included

All design artifacts live under `design-system/`. `PULL_REQUEST.md` stays at the
repo root.

| Path | Description |
|------|-------------|
| `design-system/README.md` | Product context, content + visual foundations, iconography, index, caveats |
| `design-system/SKILL.md` | Agent Skills manifest (for Claude Code) |
| `design-system/foundations/colors_and_type.css` | All design tokens + semantic type classes + `.sf-*` primitives |
| `design-system/brand/logo-lockups/` | Logo mark + full lockups (light and navy) |
| `design-system/brand/icons/` | Iconography note (Lucide via CDN) |
| `design-system/preview-cards/` | 20 specimen cards in `type/ colors/ spacing/ components/ brand/` |
| `design-system/ui-kits/app/` | Light app shell: dashboard, command center, AI center, review queue |
| `design-system/ui-kits/marketing/` | Light landing page: hero + product mockup, pillars, CRM split, ambient scroll wash |
| `design-system/handoff/DESIGN_HANDOFF.md` | Implementation guide for wiring this into the Next.js app |

## Notes for reviewers

- **Light reskin of a dark product.** Information architecture, components, copy,
  and demo-safe framing are faithful to the shipped app; the palette is the new
  light direction.
- **Not yet wired in.** These are design-system and prototype artifacts, not
  production app code. `design-system/handoff/DESIGN_HANDOFF.md` is the
  implementation guide.
- **Font substitution.** The shipped repo uses system fonts; this system
  standardizes on Geist / Geist Mono (OFL). Swap the `@import` + `--font-sans` in
  `foundations/colors_and_type.css` to change it.
- **Logo.** No official mark existed in the repo (it used the Lucide `Radio`
  glyph); the lockups in `brand/logo-lockups/` are a minimal interpretation of that
  identity.
- **Demo-safe.** No live SMS, email, or voice; no external model calls; no real
  customer data. All UI-kit data is deterministic and fictional.
