/* SignalFlow app kit, Revenue Command Center (mission replay for one customer) */
function CommandCenter({ onNav }) {
  const R = window.SF_DATA.replay;
  const D = window.SF_DATA;
  return (
    <div className="page">
      <div className="page-head">
        <h1>Revenue Command Center</h1>
        <p>One customer, one story: signal to revenue. This replay is deterministic; no message was ever sent.</p>
      </div>

      <div className="stack">
        {/* customer hero */}
        <div className="card pad">
          <div className="between" style={{ alignItems: "flex-start" }}>
            <div className="row" style={{ gap: 14 }}>
              <span className="org-avatar" style={{ width: 48, height: 48, fontSize: 16, borderRadius: 14 }}>
                {R.customer.split(" ").map((w) => w[0]).join("")}
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.01em" }}>{R.customer}</div>
                <div className="row" style={{ gap: 8, marginTop: 5 }}>
                  <Badge variant="neutral">{R.vertical}</Badge>
                  <Badge variant="success">Consent allowed</Badge>
                  <Badge variant="info">Prefers SMS</Badge>
                </div>
              </div>
            </div>
            <Btn variant="secondary" icon="rotate-ccw">Replay</Btn>
          </div>
          <p className="b-text" style={{ marginTop: 14, fontSize: 13 }}>{R.summary}</p>
          <div className="grid-3" style={{ marginTop: 16 }}>
            {R.scores.map((s) => (
              <div key={s.label}>
                <div className="between" style={{ marginBottom: 7 }}>
                  <span className="muted" style={{ fontSize: 12 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }} className="tnum">{s.score}</span>
                </div>
                <Meter value={s.score} color={s.tone} />
              </div>
            ))}
          </div>
        </div>

        {/* pipeline status */}
        <div className="card pad">
          <div className="section-label" style={{ marginBottom: 18 }}>Pipeline status</div>
          <div className="pipeline">
            {D.pipeline.map((p, i) => (
              <div className="pnode" key={p.name} style={{ opacity: i <= 4 ? 1 : 0.45 }}>
                <span className="pic" style={{ background: i <= 4 ? p.color : "#CBD5E1" }}><Icon name={p.icon} size={21} /></span>
                <span className="pname">{p.name}</span>
                <span className="pmeta">{i < 4 ? "complete" : i === 4 ? "in progress" : "pending"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* mission replay timeline + side panel */}
        <div className="grid-2" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
          <SectionCard title="Mission replay" icon="git-commit-horizontal">
            <div className="tl">
              {R.steps.map((s) => (
                <div className={`tl-item ${s.state}`} key={s.title}>
                  <span className="tl-dot" />
                  <div className="tl-time">{s.time}</div>
                  <div className="tl-title">{s.title}</div>
                  <div className="tl-text">{s.text}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="stack">
            <SectionCard title="Active recommendation" icon="sparkles">
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>Send service-recall follow-up</div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>via SMS · confidence 87</div>
              <Meter value={87} height={6} />
              <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                <Badge variant="success">High confidence</Badge>
                <span className="link" onClick={() => onNav("review")}>Open in review →</span>
              </div>
            </SectionCard>
            <div className="banner banner-amber">
              <Icon name="shield-check" size={18} color="var(--warning)" style={{ marginTop: 1 }} />
              <div>
                <div className="b-title" style={{ color: "var(--warning-text)" }}>Held for human review</div>
                <div className="b-text">Recall messaging is policy-sensitive, so a person must approve it before the workflow simulates a send.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandCenter });
