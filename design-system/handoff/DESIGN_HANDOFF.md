# SignalFlow Design System, Implementation Handoff

This guide is for wiring the light enterprise design system into the production
SignalFlow Next.js app (`mpalmer79/SignalFlow`). The files under `design-system/`
are standalone artifacts (tokens, specimen cards, and HTML/JSX UI-kit prototypes).
They are intentionally framework-free so they are easy to review. This document
explains how to translate them into the real app.

> Keep the deterministic, demo-safe framing intact at every step: no live SMS,
> email, or voice; no AI provider calls; no real customer data.

## 1. What maps to what

| Design-system artifact | Production target |
|------------------------|-------------------|
| `foundations/colors_and_type.css` (`:root` tokens) | `app/globals.css` CSS variables + `tailwind.config.ts` theme |
| `.sf-btn` / `.sf-badge` / `.sf-meter` primitives | `components/ui/button.tsx`, `badge.tsx`, score meters |
| `ui-kits/app/*` screens | `app/(app)/dashboard`, `revenue-command-center`, `ai-center`, `review-queue` |
| `ui-kits/marketing/*` | `app/page.tsx` (landing) |
| `brand/logo-lockups/*` | a real `components/brand/logo.tsx` + favicon |

## 2. Tokens first (the important part)

The shipped app is **dark**. This system is **light**. The cleanest path is to swap
the token values, not to touch every component.

1. In `app/globals.css`, replace the `:root` HSL values with the light values from
   `foundations/colors_and_type.css`. The app already consumes them through Tailwind
   (`background`, `foreground`, `card`, `primary`, `muted`, `border`, `success`,
   `warning`, `danger`), so most components re-skin automatically.
2. Remove `className="dark"` from `<html>` in `app/layout.tsx` (the system is light
   by default).
3. Map the token names:
   - `--background` -> `#F7F9FC`, `--card` -> `#FFFFFF`, `--foreground` -> `#0B1B36`
   - `--primary` -> `#2563EB` (keep this exact blue), `--ring` -> `#2563EB`
   - `--muted-foreground` -> `#64748B`, `--border` -> `#E5EAF1`
   - status colors per the `--success` / `--warning` / `--danger` tokens here
4. Add Geist + Geist Mono via `next/font/google` and point `--font-sans` /
   `--font-mono` at them. (The repo currently uses system fonts.)

## 3. Component parity

The HTML/JSX in the UI kits is cosmetic, not production code. When porting:

- Reuse the existing `components/ui/*` and `components/*-card.tsx` structure; only
  the token values and a few radii/shadows change.
- The new soft shadow ramp (`--shadow-sm` ... `--shadow-xl`) and hairline borders do
  the structural work in the light theme. Apply `--shadow-sm` to cards and the
  `hover:border-primary/40` lift already present in the repo.
- The signal-to-revenue pipeline uses the fixed `--pipe-*` color order. Use it for
  any stepper, command-center status row, or diagram.

## 4. Marketing page

`ui-kits/marketing/` is the redesigned `app/page.tsx`. Port the section order (hero
with product mockup, logo strip, pillars, "not just a CRM" split, command-center
band, demo-safe strip, footer). The ambient scroll wash is CSS-only
(`marketing.css` body gradient + fixed `::before` radial layer + the
`@supports (animation-timeline: scroll())` enhancement); it can move verbatim into a
global stylesheet or a scoped CSS module.

## 5. Icons

The app already uses **Lucide** (`lucide-react`). No change needed. Keep the icon-tile
motif (a Lucide glyph in a 40px rounded tile tinted to status). No emoji.

## 6. Review checklist before merging

- [ ] Tokens swapped; app renders light with `#2563EB` primary
- [ ] Geist / Geist Mono loaded
- [ ] Dashboard, Revenue Command Center, AI Center, Review Queue re-skinned
- [ ] Landing page ported with the ambient wash
- [ ] Navy used only as a selective accent (CTA bands, hero chrome), not as a theme
- [ ] Demo-safe copy preserved everywhere
- [ ] No em dashes in copy
