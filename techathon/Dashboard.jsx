// Dashboard.jsx — Main dashboard page

// KLSkylineSVG and HibiscusAccent come from SharedComponents.jsx

function ClassroomCard({ room, onClick, tutorialHighlight }) {
  const statusLabel = { occupied: '🟢 Occupied', empty: '⚫ Empty', soon: '🟡 Class Soon', waste: '⚠️ Waste Detected' };
  const statusClass = { occupied: 'occupied', empty: 'empty', soon: 'soon', waste: 'waste' };

  return (
    <div
      className={`classroom-card batik-bg ${room.status === 'waste' ? 'waste' : ''}`}
      onClick={() => onClick(room.id)}
      data-room-id={room.id}
      style={tutorialHighlight ? { position: 'relative', zIndex: 3001 } : {}}
    >
      <div className="card-header">
        <div>
          <div className="card-room-name">{room.name}</div>
          <div className="card-dept">{room.dept}</div>
        </div>
        <span className={`status-badge ${statusClass[room.status]}`}>
          {statusLabel[room.status]}
        </span>
      </div>

      <div className="card-next-class">
        <span>📅</span>
        {room.currentClass
          ? <span style={{ color: 'var(--gold)' }}>Now: {room.currentClass.name}</span>
          : room.nextClass
          ? <span>Next: {room.nextClass.time} — {room.nextClass.name}</span>
          : <span>No classes scheduled today</span>}
      </div>

      <div className="card-energy">
        {room.rmSaved >= 0
          ? `💛 Saving RM${room.rmSaved.toFixed(2)} today`
          : `⚠️ RM${Math.abs(room.rmSaved).toFixed(2)} wasted today`}
      </div>

      <div className="card-appliances">
        {[
          { key: 'ac', icon: '🌬️', label: 'AC' },
          { key: 'projector', icon: '📽️', label: 'Projector' },
          { key: 'lights', icon: '💡', label: 'Lights' },
          { key: 'outlets', icon: '🔌', label: 'Outlets' },
        ].map(({ key, icon }) => {
          const isOn = room.appliances[key];
          const isWaste = room.status === 'waste' && isOn;
          return (
            <div key={key} className={`appliance-icon ${isWaste ? 'waste-on' : isOn ? 'on' : 'off'}`} title={key}>
              {icon}
            </div>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-secondary)', alignSelf: 'center' }}>
          {room.occupancy > 0 ? `${room.occupancy} people` : 'Empty'}
        </div>
      </div>
    </div>
  );
}

function StatBar({ stats, theme }) {
  const isLight = theme === 'light';
  const barBg = isLight
    ? 'linear-gradient(90deg,#dce8ff 0%,#eef3ff 50%,#dce8ff 100%)'
    : 'linear-gradient(90deg,#0A1628 0%,#0F1F3A 50%,#0A1628 100%)';
  const borderCol = isLight ? 'rgba(26,63,143,0.18)' : 'rgba(255,199,44,0.15)';
  return (
    <div className="stat-bar" style={{ background: barBg, borderColor: borderCol }}>
      <div className="stat-item">
        <div className="stat-live-dot"></div>
        <div className="stat-value font-display">{stats.kwh.toFixed(1)}</div>
        <div className="stat-label">kWh Saved Today</div>
      </div>
      <div className="stat-item">
        <div className="stat-value font-display">RM {stats.rm.toFixed(2)}</div>
        <div className="stat-label">Cost Saved Today</div>
      </div>
      <div className="stat-item">
        <div className="stat-value font-display">{stats.co2.toFixed(1)} kg</div>
        <div className="stat-label">CO₂ Prevented</div>
      </div>
      <div className="stat-item">
        <div className="stat-value font-display" style={{ color: stats.alerts > 0 ? '#FF3B3B' : 'var(--gold)' }}>
          {stats.alerts}
        </div>
        <div className="stat-label">Active Waste Alerts</div>
      </div>
      <div className="stat-item">
        <div className="stat-value font-display">{stats.rooms}</div>
        <div className="stat-label">Rooms Monitored</div>
      </div>
    </div>
  );
}

function Leaderboard() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-header">
        <div className="section-title">🏆 Efficiency Leaderboard — This Week</div>
      </div>
      <div className="leaderboard-card batik-bg">
        {/* Batik strip at top */}
        <div className="batik-strip"></div>
        {LEADERBOARD.map((item, i) => (
          <div key={item.rank} className="lb-row">
            <div className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
              {i < 3 ? ['🥇','🥈','🥉'][i] : item.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div className="lb-name">{item.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.dept}</div>
            </div>
            <div className="lb-bar-wrap">
              <div className="lb-bar" style={{ width: `${item.score}%` }}></div>
            </div>
            <div className="lb-score" style={{ minWidth: 48, textAlign: 'right' }}>
              {item.score}/100
              <span style={{ marginLeft: 4, fontSize: '10px', color: item.trend === '↑' ? '#2ECC71' : item.trend === '↓' ? '#FF3B3B' : 'var(--text-secondary)' }}>
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ onSelectRoom, tutorialStep, tutorialActive, theme }) {
  const [stats, setStats] = React.useState({ kwh: 32.1, rm: 146.80, co2: 16.05, alerts: 2, rooms: 6 });
  const [toasts, setToasts] = React.useState([]);
  const [searchVal, setSearchVal] = React.useState('');
  const [filtered, setFiltered] = React.useState(CLASSROOMS);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        kwh: +(prev.kwh + (Math.random() * 0.04)).toFixed(2),
        rm: +(prev.rm + (Math.random() * 0.18)).toFixed(2),
        co2: +(prev.co2 + (Math.random() * 0.02)).toFixed(2),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const toastMessages = [
      '💛 Lecture Hall 2 lights auto-dimmed — daylight sufficient',
      '⚡ Tutorial Room 3 prepped for 4:30PM class',
      '🌡️ Lab 2 AC flagged — shutoff sequence initiated',
    ];
    let idx = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        if (idx < toastMessages.length) {
          setToasts(prev => [...prev, { id: Date.now(), text: toastMessages[idx] }]);
          idx++;
        } else clearInterval(interval);
      }, 6000);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!searchVal.trim()) {
      setFiltered(CLASSROOMS);
    } else {
      setFiltered(CLASSROOMS.filter(r =>
        r.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        r.dept.toLowerCase().includes(searchVal.toLowerCase())
      ));
    }
  }, [searchVal]);

  const handleQuickAction = (action) => {
    setToasts(prev => [...prev, { id: Date.now(), text: action }]);
  };

  return (
    <div>
      <StatBar stats={stats} theme={theme} />

      <div className="dashboard-body" style={{ position: 'relative' }}>
        {/* KL Skyline watermark */}
        <KLSkylineSVG style={{
          position: 'absolute', bottom: 36, left: 0, right: 0,
          width: '100%', height: 'auto', opacity: 0.04,
          fill: 'var(--text-primary)', pointerEvents: 'none', zIndex: 0
        }} />

        {/* Malaysian accent bar with real hibiscus PNGs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HibiscusAccent size={24} />
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', borderRadius: 2, opacity: 0.4 }}></div>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Universiti Malaya · Smart Campus</span>
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(270deg, var(--gold), transparent)', borderRadius: 2, opacity: 0.4 }}></div>
          <HibiscusAccent size={24} style={{ transform: 'scaleX(-1)' }} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-btn danger" onClick={() => handleQuickAction('🔴 Shutting down all empty rooms...')}>
            🔴 Shut Down All Empty Rooms
          </button>
          <button className="quick-btn" onClick={() => handleQuickAction('💛 Preparing all rooms for next class...')}>
            💛 Prepare Rooms for Next Class
          </button>
          <button className="quick-btn" onClick={() => handleQuickAction('📊 Generating waste report...')}>
            📊 Today&apos;s Waste Report
          </button>
        </div>

        {/* Section header with real hibiscus */}
        <div className="section-header">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HibiscusAccent size={22} />
            Live Classroom Monitor
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span className="sensor-ping" style={{ marginRight: 6 }}></span>
            Real-time · Updated every 30s
          </div>
        </div>

        <div className="classroom-grid" style={{ marginBottom: 32 }}>
          {filtered.map((room) => (
            <ClassroomCard
              key={room.id}
              room={room}
              onClick={onSelectRoom}
              tutorialHighlight={tutorialActive && tutorialStep === 2 && room.id === 'lh1'}
            />
          ))}
        </div>

        <Leaderboard />

        {/* Footer */}
        <div className="footer">
          BIJAK v0.1 PROTOTYPE · Built for UM Technothon 2026 · Data shown is simulated for demo purposes · Powered by KAWAN
        </div>
      </div>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
