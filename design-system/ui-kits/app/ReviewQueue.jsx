/* SignalFlow app kit, Review Queue: human governance of AI recommendations */
function ReviewQueue() {
  const D = window.SF_DATA;
  const [decisions, setDecisions] = useState({}); // id -> "approved" | "rejected"
  const decide = (id, v) => setDecisions((d) => ({ ...d, [id]: v }));
  const pending = D.reviews.filter((r) => !decisions[r.id]).length;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Review Queue</h1>
        <p>Sensitive recommendations are routed here for a human decision before any workflow runs. Nothing is sent on approval, the send is simulated.</p>
      </div>

      <div className="banner banner-amber" style={{ marginBottom: 18 }}>
        <Icon name="clipboard-check" size={18} color="var(--warning)" style={{ marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <div className="b-title" style={{ color: "var(--warning-text)" }}>{pending} recommendation{pending === 1 ? "" : "s"} awaiting your decision</div>
          <div className="b-text">Approve to queue a simulated follow-up, or reject to hold it. Every decision writes an audit event.</div>
        </div>
      </div>

      <div>
        {D.reviews.map((r) => {
          const decision = decisions[r.id];
          return (
            <div className={`card review-card${decision ? " decided" : ""}`} key={r.id}>
              <div className="between" style={{ alignItems: "flex-start" }}>
                <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                  <IconTile name={r.channel === "Voice" ? "phone-call" : r.channel === "Email" ? "mail" : "message-square"} tone={r.confidence >= 80 ? "blue" : r.confidence >= 70 ? "amber" : "red"} />
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{r.label}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{r.who} · {r.vertical} · via {r.channel}</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Badge variant={stateVariant(r.tier)}>{r.tier}</Badge>
                  <span className="mono muted" style={{ fontSize: 11 }}>{r.id}</span>
                </div>
              </div>

              <div style={{ margin: "14px 0 4px", maxWidth: 420 }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 11.5 }}>Confidence</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">{r.confidence}</span>
                </div>
                <Meter value={r.confidence} height={6} color={r.confidence >= 80 ? "var(--brand-blue)" : r.confidence >= 70 ? "var(--warning)" : "var(--danger)"} />
              </div>

              <div className="exp">
                <div className="metric-label" style={{ marginBottom: 6 }}>Why this recommendation</div>
                {r.rationale.map((line) => (
                  <div className="exp-line" key={line}><Icon name="check" size={14} />{line}</div>
                ))}
              </div>

              <div className="between" style={{ marginTop: 14 }}>
                {decision ? (
                  <Badge variant={decision === "approved" ? "success" : "danger"}>
                    {decision === "approved" ? "Approved, simulated follow-up queued" : "Rejected, held, no action taken"}
                  </Badge>
                ) : (
                  <span className="muted" style={{ fontSize: 12 }}>Your decision is recorded to the audit trail.</span>
                )}
                <div className="row" style={{ gap: 8 }}>
                  <Btn variant="secondary" icon="x" onClick={() => decide(r.id, "rejected")} disabled={!!decision}>Reject</Btn>
                  <Btn variant="primary" icon="check" onClick={() => decide(r.id, "approved")} disabled={!!decision}>Approve</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ReviewQueue });
