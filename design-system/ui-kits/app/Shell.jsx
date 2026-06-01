/* SignalFlow app kit, app shell: Sidebar + Topbar */
const { useState: useStateShell } = React;

function Sidebar({ current, onNav }) {
  const D = window.SF_DATA;
  return (
    <aside className="sidebar">
      <div className="side-logo">
        <img src="../../brand/logo-lockups/logo-full.svg" alt="SignalFlow" />
      </div>
      <nav className="side-nav">
        <div className="nav-label">Flagship</div>
        {D.nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item${current === item.id ? " active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </button>
        ))}
        <div className="nav-label">Platform</div>
        {D.navSecondary.map((item) => (
          <button
            key={item.id}
            className={`nav-item${current === item.id ? " active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="side-foot">
        Deterministic demo. Typed mock data and mock provider boundaries only.
      </div>
    </aside>
  );
}

function Topbar({ title, desc }) {
  const D = window.SF_DATA;
  const initials = D.org.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-desc">{desc}</div>
      </div>
      <div className="topbar-actions">
        <span className="demo-tag"><Icon name="shield-check" size={13} /> Demo-safe</span>
        <span className="org-chip">
          <span className="meta" style={{ textAlign: "right" }}>
            <span className="nm" style={{ display: "block" }}>{D.org.name}</span>
            <span className="role" style={{ display: "block" }}>{D.org.role}</span>
          </span>
          <span className="org-avatar">{initials}</span>
        </span>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
