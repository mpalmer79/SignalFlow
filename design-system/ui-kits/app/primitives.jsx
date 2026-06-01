/* SignalFlow app kit, shared primitives. Exports to window for cross-file use. */
const { useState, useEffect, useRef, useLayoutEffect } = React;

/* Imperative Lucide icon, converts only its own <i>, so repeated mounts stay cheap. */
function Icon({ name, size = 18, color, style, className }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    window.lucide.createIcons({ attrs: { width: size, height: size } });
  }, [name, size]);
  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color, ...style }}
    />
  );
}

function Badge({ variant = "neutral", children, style }) {
  return <span className={`sf-badge sf-badge-${variant}`} style={style}>{children}</span>;
}

/* status → badge variant helpers */
const stateVariant = (s) => ({
  "Pending review": "warning", "Needs review": "warning", Approved: "success",
  Rejected: "danger", Medium: "neutral", "Medium confidence": "neutral",
  "High confidence": "success", Low: "danger",
}[s] || "neutral");

function Btn({ variant = "primary", children, onClick, style, icon, disabled }) {
  return (
    <button className={`sf-btn sf-btn-${variant}`} onClick={onClick} style={style} disabled={disabled}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

function IconTile({ name, tone = "blue" }) {
  return <span className={`icon-tile tile-${tone}`}><Icon name={name} size={20} /></span>;
}

function MetricCard({ label, value, hint, icon, tone }) {
  return (
    <div className="card">
      <div className="metric">
        <div>
          <div className="metric-label">{label}</div>
          <div className="metric-val">{value}</div>
          {hint && <div className="metric-hint">{hint}</div>}
        </div>
        {icon && <IconTile name={icon} tone={tone} />}
      </div>
    </div>
  );
}

function Meter({ value, color = "var(--brand-blue)", height = 7 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 60); return () => clearTimeout(t); }, [value]);
  return <div className="meter" style={{ height }}><span style={{ width: `${w}%`, background: color }} /></div>;
}

function SectionCard({ title, icon, action, onAction, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{icon && <Icon name={icon} size={16} />}{title}</div>
        {action && <span className="link" onClick={onAction}>{action}</span>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

Object.assign(window, { Icon, Badge, Btn, IconTile, MetricCard, Meter, SectionCard, stateVariant });
