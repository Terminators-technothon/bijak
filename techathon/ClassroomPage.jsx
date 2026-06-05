// ClassroomPage.jsx — Individual classroom detail page

function ToggleSwitch({ on, waste, onChange }) {
  const cls = waste ? 'waste' : on ? 'on' : '';
  return (
    <div className={`toggle-switch ${cls}`} onClick={onChange}>
      <div className="toggle-knob"></div>
    </div>
  );
}

function EnergyRing({ score }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="energy-ring">
      <svg className="ring-svg" viewBox="0 0 100 100">
        <circle className="ring-bg" cx="50" cy="50" r={r} />
        <circle
          className="ring-fill"
          cx="50" cy="50" r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="efficiency-score">
        <div className="eff-number">{score}</div>
        <div className="eff-label">/ 100</div>
      </div>
    </div>
  );
}

function ClassroomPage({ roomId, onBack, tutorialStep, tutorialActive, onTutorialAction }) {
  const room = CLASSROOMS.find(r => r.id === roomId) || CLASSROOMS[0];

  const [appliances, setAppliances] = React.useState({ ...room.appliances });
  const [acTemp, setAcTemp] = React.useState(room.acTemp || 24);
  const [brightness, setBrightness] = React.useState(room.brightness || 80);
  const [feed, setFeed] = React.useState([...room.sensorFeed]);
  const [energyToday, setEnergyToday] = React.useState(room.energyToday);
  const [efficiency, setEfficiency] = React.useState(room.efficiency);

  // Tutorial step 5 — inject fake sensor event
  React.useEffect(() => {
    if (tutorialActive && tutorialStep === 4) {
      const t = setTimeout(() => {
        setFeed(prev => [
          { time: 'Just now', text: '2 people detected at entrance 👀 — no class scheduled', type: 'alert', icon: '👥' },
          ...prev
        ]);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [tutorialActive, tutorialStep]);

  // Tutorial step 6 — turn on appliances with animation
  React.useEffect(() => {
    if (tutorialActive && tutorialStep === 5) {
      setAppliances({ ac: true, projector: true, lights: true, outlets: true });
      setFeed(prev => [
        { time: 'Just now', text: 'All appliances activated — AC 24°C, Projector ON, Lights 80% 💛', type: 'success', icon: '⚡' },
        ...prev
      ]);
    }
  }, [tutorialActive, tutorialStep]);

  // Tutorial step 7 — bump energy stats
  React.useEffect(() => {
    if (tutorialActive && tutorialStep === 6) {
      setEnergyToday(prev => +(prev + 0.4).toFixed(1));
      setEfficiency(91);
    }
  }, [tutorialActive, tutorialStep]);

  const toggleAppliance = (key) => {
    setAppliances(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const state = next[key] ? 'ON' : 'OFF';
      const icons = { ac: '🌬️', projector: '📽️', lights: '💡', outlets: '🔌' };
      const labels = { ac: 'AC', projector: 'Projector', lights: 'Lights', outlets: 'Outlets' };
      setFeed(f => [
        { time: 'Just now', text: `${icons[key]} ${labels[key]} turned ${state} manually`, type: next[key] ? 'success' : 'normal', icon: icons[key] },
        ...f
      ]);
      return next;
    });
  };

  const statusColors = { occupied: '#2ECC71', empty: 'var(--text-secondary)', soon: 'var(--gold)', waste: '#FF3B3B' };
  const statusLabels = { occupied: '🟢 Occupied', empty: '⚫ Empty', soon: '🟡 Class Soon', waste: '⚠️ Waste Detected' };

  return (
    <div className="classroom-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>

      {/* Status Banner */}
      <div
        className="room-status-banner batik-bg"
        data-panel="status-banner"
        style={{
          zIndex: tutorialActive && (tutorialStep === 3) ? 3001 : 'auto',
          position: 'relative'
        }}
      >
        <div>
          <div className="room-title">{room.name}</div>
          <div className="room-subtitle">{room.dept} · {room.building} · Capacity: {room.capacity}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`status-badge ${room.status}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
              {statusLabels[room.status]}
            </span>
            {room.occupancy > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="sensor-ping"></span> {room.occupancy} detected
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Efficiency Score</div>
          <div style={{ fontFamily: 'Archivo Black', fontSize: '36px', color: 'var(--gold)', textShadow: 'var(--gold-glow)' }}>
            {efficiency}<span style={{ fontSize: '18px' }}>/100</span>
          </div>
        </div>
      </div>

      <div className="classroom-grid-2">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sensor Feed */}
          <div
            className="panel-card"
            data-panel="sensor-feed"
            style={{ zIndex: tutorialActive && tutorialStep === 3 ? 3001 : 'auto', position: 'relative' }}
          >
            <div className="panel-card-header">
              <div className="panel-card-title">📡 Live Sensor Feed</div>
              <span className="sensor-ping"></span>
            </div>
            <div className="panel-card-body" style={{ padding: 0 }}>
              <div className="sensor-feed" style={{ padding: '12px 16px' }}>
                {feed.map((item, i) => (
                  <div key={i} className={`feed-item ${item.type}`}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <div>
                      <div className="feed-text">{item.text}</div>
                      <div className="feed-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div
            className="panel-card"
            data-panel="schedule"
            style={{ zIndex: tutorialActive && tutorialStep === 3 ? 3001 : 'auto', position: 'relative' }}
          >
            <div className="panel-card-header">
              <div className="panel-card-title">📅 Today&apos;s Schedule</div>
            </div>
            <div className="panel-card-body">
              {room.schedule.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No classes scheduled today</div>
              ) : (
                room.schedule.map((s, i) => (
                  <div key={i} className={`schedule-item ${s.status === 'active' ? 'sched-active' : ''}`}>
                    <div>
                      <div className="sched-time">{s.time}</div>
                      <div className="sched-class">{s.name}</div>
                      <div className="sched-lecturer">{s.lecturer}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      {s.status === 'done' && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Done</span>}
                      {s.status === 'active' && <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>● LIVE</span>}
                      {s.status === 'upcoming' && <span style={{ fontSize: 10, color: '#2ECC71' }}>Upcoming</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Appliances */}
          <div
            className="panel-card"
            data-panel="appliances"
            style={{ zIndex: tutorialActive && tutorialStep === 5 ? 3001 : 'auto', position: 'relative' }}
          >
            <div className="panel-card-header">
              <div className="panel-card-title">⚙️ Appliance Control</div>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Manual Override</span>
            </div>
            <div className="panel-card-body">
              {[
                {
                  key: 'ac', icon: '🌬️', label: 'Air Conditioning',
                  detail: appliances.ac ? `Running at ${acTemp}°C` : 'Off',
                  extra: appliances.ac && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <button onClick={() => setAcTemp(t => Math.max(16, t - 1))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>−</button>
                      <span style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600, minWidth: 36, textAlign: 'center' }}>{acTemp}°C</span>
                      <button onClick={() => setAcTemp(t => Math.min(30, t + 1))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>+</button>
                    </div>
                  )
                },
                {
                  key: 'projector', icon: '📽️', label: 'Projector',
                  detail: appliances.projector ? 'Active · HDMI signal detected' : 'Off',
                },
                {
                  key: 'lights', icon: '💡', label: 'Lights',
                  detail: appliances.lights ? `On · ${brightness}% brightness` : 'Off',
                  extra: appliances.lights && (
                    <div style={{ marginTop: 6 }}>
                      <input
                        type="range" min="10" max="100" value={brightness}
                        onChange={e => setBrightness(+e.target.value)}
                        style={{ width: '100%', accentColor: 'var(--gold)' }}
                      />
                    </div>
                  )
                },
                {
                  key: 'outlets', icon: '🔌', label: 'Power Outlets',
                  detail: appliances.outlets ? 'Outlets live' : 'Off',
                },
              ].map(({ key, icon, label, detail, extra }) => {
                const isWaste = room.status === 'waste' && appliances[key];
                return (
                  <div key={key} className="appliance-row">
                    <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{icon}</div>
                    <div className="appliance-info">
                      <div className="appliance-name">
                        {label}
                        {isWaste && <span style={{ fontSize: 10, color: 'var(--red-alert)', marginLeft: 4 }}>⚠️ WASTE</span>}
                      </div>
                      <div className="appliance-detail" style={{ color: appliances[key] ? 'var(--gold)' : undefined }}>{detail}</div>
                      {extra}
                    </div>
                    <ToggleSwitch
                      on={appliances[key]}
                      waste={isWaste}
                      onChange={() => toggleAppliance(key)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Energy Stats */}
          <div
            className="panel-card"
            data-panel="energy-stats"
            style={{ zIndex: tutorialActive && tutorialStep === 6 ? 3001 : 'auto', position: 'relative' }}
          >
            <div className="panel-card-header">
              <div className="panel-card-title">⚡ Energy Statistics</div>
            </div>
            <div className="panel-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                <EnergyRing score={efficiency} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Efficiency Score</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {efficiency >= 80 ? '✅ Excellent' : efficiency >= 60 ? '🟡 Average' : '🔴 Poor'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Waste events prevented: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{room.wasteEvents}</span>
                  </div>
                </div>
              </div>

              <div className="energy-compare">
                <div className="energy-stat-mini">
                  <div className="esm-value">{energyToday}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 2 }}>kWh Today</div>
                  <div style={{ fontSize: 9, color: energyToday < room.energyYesterday ? '#2ECC71' : '#FF3B3B' }}>
                    vs {room.energyYesterday} yesterday
                  </div>
                </div>
                <div className="energy-stat-mini">
                  <div className="esm-value" style={{ color: room.rmSaved >= 0 ? 'var(--gold)' : '#FF3B3B' }}>
                    {room.rmSaved >= 0 ? '+' : ''}RM{room.rmSaved.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                    {room.rmSaved >= 0 ? 'Saved Today' : 'Wasted Today'}
                  </div>
                </div>
                <div className="energy-stat-mini">
                  <div className="esm-value" style={{ fontSize: 14 }}>
                    {(energyToday * 0.5).toFixed(1)} kg
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>CO₂ Today</div>
                </div>
              </div>

              {/* KAWAN alert in this panel */}
              {room.status === 'waste' && (
                <div style={{
                  marginTop: 14,
                  background: 'rgba(255,59,59,0.1)',
                  border: '1px solid rgba(255,59,59,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#FF3B3B',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start'
                }}>
                  <span>⚠️</span>
                  <span>KAWAN detected waste patterns in this room. Appliances running with no occupancy detected for 2+ hours.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        BIJAK v0.1 PROTOTYPE · Built for UM Technothon 2026 · Data shown is simulated for demo purposes · Powered by KAWAN
      </div>
    </div>
  );
}
