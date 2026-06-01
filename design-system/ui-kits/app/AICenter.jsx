/* SignalFlow app kit, AI Center: governed recommendation grid */
function AICenter({ onNav }) {
  const D = window.SF_DATA;
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Pending review", "Approved", "Needs review", "Rejected"];
  const recs = D.aiRecs.filter((r) => filter === "All" || r.state === filter);
  return (
    <div className="page">
      <div className="page-head">
        <h1>AI Center</h1>
        <p>Every recommendation carries a confidence score and a full explanation. Output is deterministic, no external model is called.</p>
      </div>

      <div className="stack">
        <div className="grid-4">
          <MetricCard label="Recommendations" value="412" hint="Deterministic, provider-free" icon="brain-circuit" tone="blue" />
          <MetricCard label="Pending review" value="7" hint="Awaiting a human decision" icon="shield-question" tone="amber" />
          <MetricCard label="Avg confidence" value="84" hint="0 to 100" icon="gauge" tone="blue" />
          <MetricCard label="Approved" value="318" hint="Cleared by human review" icon="check-circle-2" tone="green" />
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              className={`sf-btn ${filter === f ? "sf-btn-primary" : "sf-btn-secondary"}`}
              style={{ height: 34, padding: "0 14px", fontSize: 12.5 }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {recs.map((r) => (
            <div className="card hover" key={r.label + r.who} style={{ padding: 16 }} onClick={() => onNav("review")}>
              <div className="between" style={{ alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.label}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{r.who}</div>
                </div>
                <Badge variant={stateVariant(r.state)}>{r.state}</Badge>
              </div>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="muted" style={{ fontSize: 11 }}>Confidence</span>
                <span style={{ fontSize: 12, fontWeight: 600 }} className="tnum">{r.confidence}</span>
              </div>
              <Meter value={r.confidence} height={6} color={r.confidence >= 80 ? "var(--brand-blue)" : r.confidence >= 70 ? "var(--warning)" : "var(--danger)"} />
              <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
                <Badge variant={stateVariant(r.tier)}>{r.tier}</Badge>
                <span className="muted mono" style={{ fontSize: 10.5 }}>2h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AICenter });
