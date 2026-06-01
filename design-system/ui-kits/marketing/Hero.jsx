/* SignalFlow marketing kit, Icon + Nav + Hero + product mockup */
const { useRef: useRefM, useLayoutEffect: useLayoutEffectM } = React;

function Icon({ name, size = 18, color, style }) {
  const ref = useRefM(null);
  useLayoutEffectM(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    window.lucide.createIcons({ attrs: { width: size, height: size } });
  }, [name, size]);
  return <span ref={ref} style={{ display: "inline-flex", color, ...style }} />;
}

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <img src="../../brand/logo-lockups/logo-full.svg" alt="SignalFlow" height="30" />
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#pipeline">How it works</a>
          <a href="#crm" style={{ fontWeight: 700 }}>Why not a CRM</a>
          <a href="#safety">Demo safety</a>
        </div>
        <div className="nav-cta">
          <a className="btn btn-secondary btn-sm" href="#">Sign in</a>
          <a className="btn btn-primary btn-sm" href="#">Open dashboard</a>
        </div>
      </div>
    </nav>
  );
}

function MiniPipeline() {
  const nodes = [
    { i: "bell", c: "#0EA5E9", t: "Signal" },
    { i: "brain-circuit", c: "#6366F1", t: "Intel" },
    { i: "sparkles", c: "#2563EB", t: "AI" },
    { i: "clipboard-check", c: "#D97706", t: "Review" },
    { i: "workflow", c: "#0891B2", t: "Flow" },
    { i: "banknote", c: "#16A34A", t: "Revenue" },
  ];
  return (
    <div className="mock-pipe">
      <div className="pl">Signal → revenue pipeline</div>
      <div className="mpipe">
        {nodes.map((n) => (
          <div className="mpn" key={n.t}>
            <span className="mc" style={{ background: n.c }}><Icon name={n.i} size={15} /></span>
            <span className="mt">{n.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductMock() {
  return (
    <div className="mock">
      <div className="mock-bar">
        <div className="dots"><i /><i /><i /></div>
        <div className="mock-url"><Icon name="lock" size={12} /> app.signalflow.io/dashboard</div>
      </div>
      <div className="mock-body">
        <div className="mock-side">
          <div className="mi on"><Icon name="layout-dashboard" size={15} /> Dashboard</div>
          <div className="mi"><Icon name="radar" size={15} /> Command Center</div>
          <div className="mi"><Icon name="sparkles" size={15} /> AI Center</div>
          <div className="mi"><Icon name="clipboard-check" size={15} /> Review Queue</div>
          <div className="mi"><Icon name="phone-call" size={15} /> Voice</div>
          <div className="mi"><Icon name="gauge" size={15} /> Executive</div>
        </div>
        <div className="mock-main">
          <div className="mock-h">Revenue command center</div>
          <div className="mock-sub">Deterministic view · nothing sent</div>
          <div className="mock-metrics">
            <div className="mm"><div className="l">Influenced</div><div className="v">$1.24M</div><div className="d"><Icon name="trending-up" size={11} /> +18%</div></div>
            <div className="mm"><div className="l">High intent</div><div className="v">38</div><div className="d"><Icon name="trending-up" size={11} /> +6</div></div>
            <div className="mm"><div className="l">In review</div><div className="v">7</div><div className="d" style={{ color: "var(--warning-text)" }}><Icon name="clock" size={11} /> pending</div></div>
          </div>
          <MiniPipeline />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="hero-grid" />
      <div className="hero-glow" />
      <div className="wrap hero-in">
        <span className="eyebrow"><Icon name="radio" size={14} /> AI-native revenue platform</span>
        <h1>Turn customer signals into <span className="accent">governed revenue actions</span>.</h1>
        <p>SignalFlow reads customer signals, scores intent, and orchestrates the next best action with consent, explanation, and human review at the center. A CRM records. SignalFlow acts.</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#">Run the 60-second demo <Icon name="arrow-right" size={17} /></a>
          <a className="btn btn-secondary" href="#">Open dashboard</a>
        </div>
        <div className="hero-note">Deterministic demo. No live SMS, email, or voice · no external model calls · no real customer data.</div>
        <ProductMock />
      </div>
    </header>
  );
}

Object.assign(window, { Icon, Nav, Hero });
