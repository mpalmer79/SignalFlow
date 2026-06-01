/* SignalFlow marketing kit, content sections */
function LogoStrip() {
  return (
    <div className="strip">
      <div className="wrap strip-in">
        <span className="lbl">Built for revenue teams in</span>
        <span className="cap">Automotive</span>
        <span className="cap">Insurance</span>
        <span className="cap">Healthcare</span>
        <span className="cap">Home Services</span>
      </div>
    </div>
  );
}

const PILLARS = [
  { i: "bell", tone: "blue", t: "Customer signals", b: "New leads, missed calls, cancellations, and recall opportunities are captured as structured signals." },
  { i: "brain-circuit", tone: "indigo", t: "Intelligence graph", b: "Every customer becomes a unified record of channels, consent, recent signals, opportunities, and risk." },
  { i: "git-branch", tone: "blue", t: "Action graph", b: "A deterministic decision flow scores intent, checks consent, picks a channel, and chooses next best action." },
  { i: "shield-check", tone: "green", t: "Consent-aware policy", b: "Every action passes a check for consent, quiet hours, and vertical sensitivity before anything is simulated." },
  { i: "sparkles", tone: "blue", t: "Governed AI", b: "Recommendations carry a confidence score and a full explanation, routed through a human review queue." },
  { i: "banknote", tone: "green", t: "Outcomes & attribution", b: "Decisions and actions produce audit events, connecting signals and policy to revenue outcomes." },
];
const toneStyle = {
  blue: { background: "var(--blue-50)", color: "var(--brand-blue)" },
  indigo: { background: "#EEF0FE", color: "#6366F1" },
  green: { background: "var(--success-bg)", color: "var(--success)" },
};

function Pillars() {
  return (
    <section className="block" id="platform">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-eyebrow">Core platform</div>
          <h2>Six durable concepts hold the platform together</h2>
          <p>From signal to revenue, every stage is deterministic, explainable, and governed, so the platform can decide and act without losing the audit trail.</p>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
            <div className="pillar" key={p.t}>
              <div className="pt" style={toneStyle[p.tone]}><Icon name={p.i} size={22} /></div>
              <h3>{p.t}</h3>
              <p>{p.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CRM_GAPS = [
  "Traditional CRMs store records but wait for a human to decide what happens next.",
  "Activity is logged after the fact instead of driving the next action in real time.",
  "Consent and compliance live in scattered fields, not an enforced policy layer.",
  "Channels are siloed, so SMS, email, and voice rarely act as one coordinated follow-up.",
];
const MODEL = ["Signal received", "Intelligence updated", "Intent scored", "Consent checked", "Channel chosen", "Action orchestrated", "Outcome recorded"];

function NotJustCRM() {
  return (
    <section className="block" id="crm" style={{ background: "rgba(255,255,255,0.6)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap split">
        <div>
          <div className="sec-eyebrow">Not just another CRM</div>
          <h2 style={{ fontSize: 34, letterSpacing: "-.02em", fontWeight: 600, margin: 0, lineHeight: 1.14 }}>A system of action, not a system of record</h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--fg-2)", marginTop: 16 }}>SignalFlow does not wait for someone to remember to follow up. It reads signals, applies policy, and orchestrates the next best action while keeping consent and compliance at the center.</p>
          <ul className="crm-list">
            {CRM_GAPS.map((g) => (
              <li key={g}><span className="x"><Icon name="x" size={13} /></span>{g}</li>
            ))}
          </ul>
        </div>
        <div className="model-card">
          <div className="mh">SignalFlow system model</div>
          {MODEL.map((s, i) => (
            <div className="model-step" key={s}>
              <span className="n">{i + 1}</span>
              <span className="s">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Band() {
  return (
    <section className="block" id="pipeline">
      <div className="wrap">
        <div className="band">
          <div className="hero-glow" style={{ top: -160, opacity: .5 }} />
          <div style={{ position: "relative" }}>
            <h2>One screen, signal to revenue</h2>
            <p>The Revenue Command Center walks a single customer from signal → intelligence → AI recommendation → human review → workflow → revenue, with a full mission replay.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#">Launch command center <Icon name="arrow-right" size={17} /></a>
              <a className="btn btn-secondary" href="#" style={{ background: "rgba(255,255,255,.06)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>View the walkthrough</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Safety() {
  return (
    <section className="block" id="safety" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="safe">
          <div className="si"><Icon name="shield-check" size={21} /></div>
          <div style={{ flex: 1 }}>
            <h4>Demo-safe by design</h4>
            <p>SignalFlow sends no live SMS, email, or voice, makes no external model calls, and uses no real customer data. Every scenario and simulation is deterministic with mock providers.</p>
          </div>
          <a className="btn btn-secondary btn-sm" href="#">Read the safety boundaries</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="../../brand/logo-lockups/logo-mark.svg" alt="" height="26" />
          <span className="fl">SignalFlow, AI-Powered Revenue Operating System. Deterministic demo.</span>
        </div>
        <div className="fr">
          <a href="#">Platform</a>
          <a href="#">Architecture</a>
          <a href="#">AI Platform</a>
          <a href="#">Voice Platform</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { LogoStrip, Pillars, NotJustCRM, Band, Safety, Footer });
