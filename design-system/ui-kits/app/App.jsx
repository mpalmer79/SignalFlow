/* SignalFlow app kit, App router */
function Placeholder({ item }) {
  return (
    <div className="page">
      <div className="page-head">
        <h1>{item.label}</h1>
        <p>This surface exists in the SignalFlow product but is not reconstructed in this UI kit. The kit focuses on the four flagship screens.</p>
      </div>
      <div className="card pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "56px 24px", textAlign: "center" }}>
        <span className="icon-tile tile-blue" style={{ width: 52, height: 52, borderRadius: 14 }}><Icon name={item.icon} size={26} /></span>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</div>
        <div className="muted" style={{ fontSize: 13, maxWidth: 420, lineHeight: 1.5 }}>
          Use the Dashboard, Revenue Command Center, AI Center, and Review Queue to explore the signal-to-revenue flow. All data is deterministic and demo-safe.
        </div>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("dashboard");
  const D = window.SF_DATA;
  const all = [...D.nav, ...D.navSecondary];
  const meta = all.find((n) => n.id === screen) || D.nav[0];

  let body;
  if (screen === "dashboard") body = <Dashboard onNav={setScreen} />;
  else if (screen === "command") body = <CommandCenter onNav={setScreen} />;
  else if (screen === "ai") body = <AICenter onNav={setScreen} />;
  else if (screen === "review") body = <ReviewQueue />;
  else body = <Placeholder item={meta} />;

  return (
    <div className="app">
      <Sidebar current={screen} onNav={setScreen} />
      <div className="main">
        <Topbar title={meta.label} desc={meta.desc || "SignalFlow"} />
        <div className="scroll" key={screen}>{body}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
