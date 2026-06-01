# SignalFlow App UI Kit

A light, high-fidelity recreation of the **SignalFlow** product app shell and its
four flagship screens. Built with React (in-browser Babel) on the design tokens in
`../../foundations/colors_and_type.css`.

> Deterministic demo. All data in `data.js` is fictional. No live SMS, email, or
> voice; no AI provider calls; no real customer data.

## Run it

Open `index.html`. It loads React 18 + Babel + Lucide from CDN, then mounts the app.

## Screens (click the sidebar)

- **Dashboard**, "Revenue command center overview": KPI metric cards, the
  signal→revenue pipeline, top-intent / detected / attention lists, workflow + AI
  metric bands, an influenced-revenue bar chart, and an audit feed.
- **Revenue Command Center**, one customer's mission replay: scores, pipeline
  status, a vertical timeline (signal → revenue), and the active recommendation.
- **AI Center**, governed recommendation grid with status filters and confidence
  meters; click any card to jump into review.
- **Review Queue**, interactive human governance: each item shows its rationale
  and confidence; **Approve / Reject** records a decision (simulated, nothing sent).

The six secondary nav items render a labelled placeholder, they exist in the real
product but are intentionally not reconstructed here (this kit focuses on the
flagship flow).

## Files

| File | Role |
|------|------|
| `index.html` | Entry, loads deps and all components |
| `kit.css` | App-shell + component styles built on the tokens |
| `data.js` | Deterministic mock data (`window.SF_DATA`) |
| `primitives.jsx` | `Icon`, `Badge`, `Btn`, `IconTile`, `MetricCard`, `Meter`, `SectionCard` |
| `Shell.jsx` | `Sidebar`, `Topbar` |
| `Dashboard.jsx` · `CommandCenter.jsx` · `AICenter.jsx` · `ReviewQueue.jsx` | Screens |
| `App.jsx` | Router state + placeholder |

## Conventions

- **Icons:** Lucide via CDN. The `Icon` component converts a single `<i data-lucide>`
  imperatively so React and Lucide don't fight over the DOM.
- **Cross-file scope:** each `.jsx` exports its components with `Object.assign(window, …)`
  because every `text/babel` script is transpiled in its own scope.
- **Styling:** token-driven. Reuse `.sf-btn`, `.sf-badge`, `.sf-meter` from the
  root CSS and the `.card` / `.metric` / `.tile-*` classes here. No hard-coded
  hex outside the token file except a few chart fills.
