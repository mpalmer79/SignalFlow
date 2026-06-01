# SignalFlow Marketing UI Kit

The redesigned **light** SignalFlow landing page, a polished, credible enterprise
B2B site. Built with React (in-browser Babel) on the design tokens in
`../../foundations/colors_and_type.css`.

> This is the light reinterpretation requested in the brief. It keeps the shipped
> landing page's copy, structure, and demo-safe framing, but moves from the dark
> navy original to an off-white canvas with navy ink and a blue primary.

## Run it

Open `index.html`. Loads React 18 + Babel + Lucide from CDN.

## Sections (top → bottom)

1. **Nav**, sticky, blurred, logo + links + sign-in / dashboard CTAs.
2. **Hero**, eyebrow pill, balanced headline with blue accent, sub-copy, dual CTA,
   the demo-safe line, and a **product mockup window** (browser chrome + mini app
   shell: sidebar, KPI cards, and the signal→revenue mini-pipeline).
3. **Logo strip**, the verticals SignalFlow serves.
4. **Pillars**, six core platform concepts as hover-lift cards with tinted tiles.
5. **Not just a CRM**, split layout: the CRM-gap list vs. a navy "system model"
   card (the 7-step signal-to-outcome sequence).
6. **Command-center band**, dark navy feature band with the one-screen pitch.
7. **Demo-safe strip**, the amber safety reassurance.
8. **Footer**, mark, positioning line, doc links.

## Files

| File | Role |
|------|------|
| `index.html` | Entry, loads deps + components |
| `marketing.css` | All landing-page styles, built on the tokens |
| `Hero.jsx` | `Icon`, `Nav`, `Hero`, and the product mockup |
| `Sections.jsx` | `LogoStrip`, `Pillars`, `NotJustCRM`, `Band`, `Safety`, `Footer` |
| `App.jsx` | Page composition + mount |

## Conventions

- **Icons:** Lucide via CDN through the imperative `Icon` component (defined in
  `Hero.jsx`, exported to `window`).
- **Cross-file scope:** components export with `Object.assign(window, …)` since each
  `text/babel` script transpiles in its own scope.
- The dark navy is used **only** as an accent (system-model card, feature band,
  footer mark), the page is light by default, per the redesign brief.
