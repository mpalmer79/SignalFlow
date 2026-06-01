---
name: signalflow-design
description: Use this skill to generate well-branded interfaces and assets for SignalFlow, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. SignalFlow is a light, enterprise B2B SaaS, an AI-native revenue operating system (signal → intelligence → governed AI recommendation → human review → simulated workflow → revenue attribution). Always preserve its demo-safe framing: no live SMS/email/voice, no AI provider calls, no real customer data.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets
out and create static HTML files for the user to view. If working on production code,
you can copy assets and read the rules here to become an expert in designing with this
brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens:** `foundations/colors_and_type.css`, colors, type scale, spacing, radius, shadow,
  plus semantic type classes (`.sf-display`, `.sf-h1`, `.sf-body`…) and `.sf-*`
  primitives (`.sf-btn`, `.sf-badge`, `.sf-meter`). Import it first, build on it.
- **Palette:** off-white canvas `#F7F9FC`, white surfaces, deep-navy ink `#0B1B36`,
  blue-600 primary `#2563EB`, signal-cyan accent `#0EA5E9`. Light by default; navy
  only as an accent band. Status: green/amber/red with tinted backgrounds.
- **Type:** Geist (sans) + Geist Mono (data/scores). 600-weight headings, tight
  tracking, tabular metrics.
- **Icons:** Lucide (`https://unpkg.com/lucide@latest`). No emoji, ever.
- **The pipeline:** Signal → Intelligence → AI → Review → Workflow → Revenue, with a
  fixed color sequence (`--pipe-*`). It's the product's spine, use it.
- **Voice:** calm, technical, sentence case, third-person product voice. Pair every
  capability claim with a governance / demo-safe caveat.

## Assets & kits

- `brand/logo-lockups/logo-mark.svg`, `logo-full.svg`, `logo-full-white.svg`
- `ui-kits/app/`, light app shell (dashboard, command center, AI center,
  review queue). Copy components from `primitives.jsx`, `Shell.jsx`, the screens.
- `ui-kits/marketing/`, light landing page (hero + product mockup,
  pillars, CRM split, command-center band).
- `preview-cards/`, foundation + component specimen cards (type, colors, spacing,
  components, brand).
- `handoff/DESIGN_HANDOFF.md`, the guide for wiring this into the production app.

## Non-negotiables

1. Keep it **light, serious, and credible**, no flashy gradients, no purple, no emoji.
2. Preserve the **demo-safe** positioning in any copy you write.
3. Use the existing tokens and Lucide icons; don't invent a new palette or icon set.
