/* SignalFlow app kit, Dashboard (Revenue command center overview) */
function Pipeline() {
  const D = window.SF_DATA;
  return (
    <div className="card pad">
      <div className="between" style={{ marginBottom: 18 }}>
        <div className="section-label">Signal → revenue pipeline</div>
        <span className="muted" style={{ fontSize: 12 }}>Deterministic · nothing sent</span>
      </div>
      <div className="pipeline">
        {D.pipeline.map((p) => (
          <div className="pnode" key={p.name}>
            <span className="pic" style={{ background: p.color }}><Icon name={p.icon} size={21} /></span>
            <span className="pname">{p.name}</span>
            <span className="pmeta">{p.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ onNav }) {
  const D = window.SF_DATA;
  return (
    <div className="page">
      <div className="page-head">
        <h1>Revenue command center</h1>
        <p>A live view of signals, consent-aware actions, and pipeline movement. Every number is produced by deterministic engines in demo mode.</p>
      </div>

      <div className="stack">
        <div className="banner banner-blue">
          <IconTile name="radar" tone="blue" />
          <div style={{ flex: 1 }}>
            <div className="b-title">Open the Revenue Command Center</div>
            <div className="b-text">One screen that walks a customer from signal → intelligence → AI recommendation → human review → workflow → revenue.</div>
          </div>
          <Btn variant="primary" icon="arrow-right" onClick={() => onNav("command")}>Launch</Btn>
        </div>

        <div className="grid-4">
          {D.metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        <Pipeline />

        <div className="grid-3">
          <SectionCard title="Top intent customers" icon="trending-up">
            <div className="list">
              {D.topIntent.map((c) => (
                <div className="lrow" key={c.name}>
                  <span className="nm"><span className="rank">{c.rank}</span>{c.name}</span>
                  <Badge variant="info">{c.score}</Badge>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recently detected" icon="sparkles">
            <div className="list">
              {D.detected.map((d) => (
                <div className="lrow lrow-bordered" key={d.type} style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                  <div className="between">
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{d.type}</span>
                    <Badge variant="success">{d.conf}%</Badge>
                  </div>
                  <span className="muted" style={{ fontSize: 11.5 }}>{d.who}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Needs attention" icon="alert-circle">
            <div className="list">
              {D.attention.map((a) => (
                <div className="lrow lrow-bordered" key={a.name} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                  <div className="row" style={{ gap: 6 }}>
                    <Badge variant="success">{a.intent}</Badge>
                    <Badge variant={a.priority === "high" ? "danger" : "warning"}>{a.priority} priority</Badge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="between" style={{ marginTop: 8 }}>
          <div className="section-label">Workflow orchestration</div>
          <span className="link" onClick={() => onNav("command")}>View orchestrator</span>
        </div>
        <div className="grid-4">
          {D.workflow.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        <div className="between" style={{ marginTop: 8 }}>
          <div className="section-label">AI recommendations</div>
          <span className="link" onClick={() => onNav("ai")}>View AI center</span>
        </div>
        <div className="grid-4">
          {D.ai.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        <div className="grid-2">
          <SectionCard title="Influenced revenue by industry" icon="bar-chart-3">
            <div className="bars">
              {D.industries.map((it) => {
                const max = Math.max(...D.industries.map((x) => x.rev));
                return (
                  <div className="barcol" key={it.name}>
                    <span className="bv tnum">${it.rev}K</span>
                    <div className="bk" style={{ height: `${(it.rev / max) * 86}px` }} />
                    <span className="bl">{it.name}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Recent audit activity" icon="scroll-text">
            <div className="list">
              {D.audit.map((a) => (
                <div className="lrow" key={a.action} style={{ cursor: "default" }}>
                  <span className="nm">
                    <span className="icon-tile tile-blue" style={{ width: 30, height: 30, borderRadius: 8 }}><Icon name={a.icon} size={15} /></span>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a.action}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{a.who}</span>
                    </span>
                  </span>
                  <span className="muted mono" style={{ fontSize: 10.5 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
