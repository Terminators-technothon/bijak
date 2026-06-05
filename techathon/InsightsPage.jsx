// InsightsPage.jsx — All 9 sustainability/insight features in one tab.
// Real Malaysia constants. Reuses UM CLASSROOMS data + UM aesthetic (navy + gold + batik).

// ═══════════════════════════════════════════════════════════
//   SHARED CONSTANTS (real published values)
// ═══════════════════════════════════════════════════════════
const UM_DEVICE_WATTS  = { ac: 1200, projector: 300, lights: 320, outlets: 80 };
const UM_GRID_CO2_KWH  = 0.694;   // Suruhanjaya Tenaga
const UM_TNB_RM_KWH    = 0.218;   // TNB domestic tariff
const UM_TREE_KG_YEAR  = 21;
const UM_PHONE_WH      = 15;

const totalRoomWatts = (room) => {
  if (!room) return 0;
  let w = 0;
  if (room.appliances?.ac)        w += UM_DEVICE_WATTS.ac;
  if (room.appliances?.projector) w += UM_DEVICE_WATTS.projector;
  if (room.appliances?.lights)    w += UM_DEVICE_WATTS.lights;
  if (room.appliances?.outlets)   w += UM_DEVICE_WATTS.outlets;
  return w;
};

// ═══════════════════════════════════════════════════════════
//   1) CARBON DEBT TRACKER — live ticking counter for wasting rooms
// ═══════════════════════════════════════════════════════════
function CarbonDebtTracker() {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Wasting rooms: anything in 'waste' status; debt accrues since a faked start time
  const wasting = React.useMemo(() => {
    return (window.CLASSROOMS || [])
      .filter(r => r.status === 'waste')
      .map(r => ({
        id: r.id, name: r.name,
        watts: totalRoomWatts(r),
        since: Date.now() - (35 + Math.random() * 25) * 60 * 1000,
      }));
  }, []);

  const totals = React.useMemo(() => {
    let kwh = 0;
    for (const r of wasting) {
      const hrs = Math.max(0, (now - r.since) / 3600000);
      kwh += (r.watts * hrs) / 1000;
    }
    return {
      kwh,
      rm:  kwh * UM_TNB_RM_KWH,
      co2: kwh * UM_GRID_CO2_KWH,
    };
  }, [wasting, now]);

  const cleared = wasting.length === 0;

  return (
    <div className={`insight-card ${cleared ? 'debt-cleared' : 'debt-active'}`}>
      <div className="insight-card-title">🔴 Live Carbon Debt</div>
      <div className="debt-big">
        {totals.kwh.toFixed(3)} <span className="debt-unit">kWh</span>
      </div>
      <div className="debt-stats">
        <span><b>RM {totals.rm.toFixed(2)}</b> wasted</span>
        <span>·</span>
        <span><b>{totals.co2.toFixed(3)} kg</b> CO₂ emitted</span>
      </div>
      <div className="debt-sub">
        {cleared
          ? 'No active waste. Every room behaving 💛'
          : `Debt accruing from ${wasting.length} room${wasting.length > 1 ? 's' : ''} — Kawan will auto-intervene if motion stays clear.`}
      </div>
      {cleared && <div className="debt-cleared-pill">DEBT CLEARED ⚡</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   2) WASTAGE SHAME LOG — receipts of every intervention
// ═══════════════════════════════════════════════════════════
function WastageShameLog() {
  const entries = React.useMemo(() => {
    const now = new Date();
    const t = m => new Date(now.getTime() - m * 60000).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    return [
      { time: t(2),   icon: '👻', title: 'Phantom load — Lab 2', detail: 'AC + lights running 41 min with nobody in the room.', savedKwh: 0.92, intervened: false },
      { time: t(45),  icon: '🌡️', title: 'AC right-sized — Lecture Hall 1', detail: '87 students detected. Bumped AC 19°C → 24°C via IR blaster.', savedKwh: 0.31, intervened: true },
      { time: t(96),  icon: '📽️', title: 'Projector idle — LH2', detail: 'No HDMI signal for 18 min during break. Kawan shut it down.', savedKwh: 0.09, intervened: true },
      { time: t(180), icon: '🌙', title: 'After-hours shutoff — Conf Room 4', detail: 'Ghost booking detected — reserved but empty. Killed power.', savedKwh: 1.42, intervened: true },
      { time: t(310), icon: '💡', title: 'Lights auto-dimmed — LH2', detail: 'Daylight sufficient. Dimmed to 70%.', savedKwh: 0.18, intervened: true },
    ];
  }, []);

  return (
    <div className="insight-card">
      <div className="insight-card-title">🧾 Wastage Shame Log</div>
      <div className="shame-log-list">
        {entries.map((e, i) => (
          <div key={i} className={`shame-row ${e.intervened ? 'intervened' : 'active'}`}>
            <span className="shame-time">{e.time}</span>
            <div className="shame-body">
              <div className="shame-title">{e.icon} {e.title}</div>
              <div className="shame-detail">{e.detail}</div>
              <div className="shame-saving">
                Saved {e.savedKwh.toFixed(2)} kWh · RM {(e.savedKwh * UM_TNB_RM_KWH).toFixed(2)} · {(e.savedKwh * UM_GRID_CO2_KWH).toFixed(2)} kg CO₂
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   3) PHANTOM LOAD DETECTOR
// ═══════════════════════════════════════════════════════════
function PhantomLoadDetector() {
  const phantoms = React.useMemo(() => {
    return (window.CLASSROOMS || [])
      .filter(r => r.status === 'waste')
      .map(r => {
        const watts = totalRoomWatts(r);
        const minutes = 35 + Math.floor(Math.random() * 30);
        const kwh = (watts * (minutes / 60)) / 1000;
        return {
          room: r.name,
          devices: Object.entries(r.appliances).filter(([_, on]) => on).map(([k]) => k).join(' + '),
          minutes,
          watts,
          kwhWasted: kwh,
        };
      });
  }, []);

  if (phantoms.length === 0) {
    return (
      <div className="insight-card">
        <div className="insight-card-title">👻 Phantom Load Detector</div>
        <div className="phantom-empty">
          ✨ No phantom loads detected. All occupied rooms are running their devices for an actual reason.
        </div>
      </div>
    );
  }
  return (
    <div className="insight-card">
      <div className="insight-card-title">👻 Phantom Load Detector — {phantoms.length} active</div>
      {phantoms.map((p, i) => (
        <div key={i} className="phantom-row">
          <span className="phantom-emoji">👻</span>
          <div style={{ flex: 1 }}>
            <div className="phantom-room">{p.room}</div>
            <div className="phantom-detail">
              <b>{p.devices}</b> running <b>{p.minutes} min</b> with no occupancy.
            </div>
            <div className="phantom-meta">
              Drawing {p.watts}W · Wasted ≈ {p.kwhWasted.toFixed(2)} kWh / RM {(p.kwhWasted * UM_TNB_RM_KWH).toFixed(2)} so far.
            </div>
          </div>
          <div className="phantom-action">SHUT DOWN</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   4) KAWAN WEEKLY SUSTAINABILITY REPORT
// ═══════════════════════════════════════════════════════════
function WeeklyReport() {
  const stats = React.useMemo(() => {
    const rooms = window.CLASSROOMS || [];
    const dailyKwhSaved = rooms.reduce((acc, r) => acc + Math.max(0, r.energyYesterday - r.energyToday), 0);
    const weekKwh = dailyKwhSaved * 5;        // 5 school days
    const weekRm  = weekKwh * UM_TNB_RM_KWH;
    const weekCo2 = weekKwh * UM_GRID_CO2_KWH;
    const interventions = rooms.reduce((acc, r) => acc + (r.wasteEvents || 0), 0);
    const grade = weekKwh > 80 ? 'A+' : weekKwh > 40 ? 'A' : weekKwh > 20 ? 'B' : 'C';
    return { weekKwh, weekRm, weekCo2, interventions, grade,
      phones: (weekKwh * 1000) / UM_PHONE_WH,
      trees:  weekCo2 / UM_TREE_KG_YEAR };
  }, []);

  return (
    <div className="insight-card weekly-report">
      <div className="insight-card-title">📰 Kawan's Weekly Report</div>
      <div className="weekly-grade">
        <span className="weekly-grade-letter">{stats.grade}</span>
        <span className="weekly-grade-label">This Week</span>
      </div>
      <div className="weekly-summary">
        UM saved <b>{stats.weekKwh.toFixed(1)} kWh</b> this week.<br/>
        That's <b>{Math.round(stats.phones)} phone charges</b> and <b>{stats.weekCo2.toFixed(1)} kg CO₂</b> prevented.<br/>
        I intervened <b>{stats.interventions} times</b> to stop waste 💛
      </div>
      <div className="weekly-stat-row">
        <div className="weekly-stat"><b>RM {stats.weekRm.toFixed(2)}</b><span>recovered</span></div>
        <div className="weekly-stat"><b>{stats.trees.toFixed(1)}</b><span>trees</span></div>
        <div className="weekly-stat"><b>{stats.interventions}</b><span>saves</span></div>
      </div>
      <div className="weekly-share">
        <span className="weekly-share-hint">📤 Share this week's report</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   5) CLASSROOM VITALS ECG PANEL
// ═══════════════════════════════════════════════════════════
function ECGVitalsPanel() {
  const rooms = window.CLASSROOMS || [];
  const [selected, setSelected] = React.useState(rooms.find(r => r.status === 'occupied')?.id || rooms[0]?.id);
  const [points, setPoints] = React.useState(() => Array(80).fill(50));
  const room = rooms.find(r => r.id === selected) || rooms[0];
  const watts = totalRoomWatts(room);

  React.useEffect(() => {
    if (!room) return;
    const isOccupied = room.status === 'occupied';
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setPoints(prev => {
        const next = prev.slice(1);
        let y = 50; // baseline (flatline when empty)
        if (room.appliances?.ac)        y += Math.sin(t * 0.4) * 8;
        if (room.appliances?.projector) y += Math.sin(t * 0.7 + 1.1) * 5;
        if (room.appliances?.lights)    y += Math.sin(t * 0.95 + 2.2) * 3.5;
        if (isOccupied && t % 18 === 0) y -= 22;             // QRS spike
        if (isOccupied && t % 18 === 1) y += 12;
        if (room.status === 'waste' && t % 9 === 0) y += 14; // erratic
        next.push(y);
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [room?.id, room?.status, room?.appliances]);

  const pathD = React.useMemo(() => {
    return points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * 380} ${y}`).join(' ');
  }, [points]);

  return (
    <div className="insight-card ecg-card">
      <div className="insight-card-title">📈 Classroom Vitals — Energy ECG</div>
      <div className="ecg-room-picker">
        {rooms.map(r => (
          <button key={r.id}
            className={`ecg-room-btn ${selected === r.id ? 'on' : ''}`}
            onClick={() => setSelected(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="ecg-screen">
        <svg viewBox="0 0 380 100" preserveAspectRatio="none">
          {/* grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(255,199,44,0.07)" strokeWidth="1"/>
          ))}
          <path d={pathD} fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }}/>
        </svg>
        <div className="ecg-readout">
          <span>Drawing <b>{watts} W</b></span>
          <span>{room?.occupancy || 0} occupants</span>
          <span className={`ecg-pulse-dot ${room?.status === 'waste' ? 'alert' : 'live'}`}></span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   6) OCCUPANCY HEATMAP TIMELINE
// ═══════════════════════════════════════════════════════════
function OccupancyHeatmap() {
  const rooms = window.CLASSROOMS || [];

  // Generate per-hour occupancy state per room (mock: realistic UM weekday pattern)
  const cells = React.useMemo(() => {
    return rooms.map(r => ({
      room: r.name,
      hours: Array.from({ length: 14 }, (_, h) => {
        const hour = h + 8; // 8am to 9pm
        const slotIsClass = r.schedule?.some(s => {
          const start = parseInt((s.time || '').split(':')[0]) || 0;
          return Math.abs(start - hour) <= 1;
        });
        const wasteWindow = r.status === 'waste' && hour >= 14 && hour <= 17;
        if (wasteWindow) return 'waste';
        if (slotIsClass) return 'occupied';
        if (hour < 9 || hour > 18) return 'empty';
        return Math.random() < 0.3 ? 'occupied' : 'empty';
      }),
    }));
  }, [rooms]);

  return (
    <div className="insight-card">
      <div className="insight-card-title">🗓️ Occupancy Heatmap — Today</div>
      <div className="heatmap-legend">
        <span><i className="heat-cell empty"></i> Empty</span>
        <span><i className="heat-cell occupied"></i> Occupied</span>
        <span><i className="heat-cell waste"></i> Waste detected</span>
      </div>
      <div className="heatmap-grid">
        {cells.map((row, ri) => (
          <div key={ri} className="heatmap-row">
            <div className="heatmap-room">{row.room}</div>
            <div className="heatmap-cells">
              {row.hours.map((state, hi) => (
                <div key={hi} className={`heat-cell ${state}`} title={`${hi + 8}:00 — ${state}`}></div>
              ))}
            </div>
          </div>
        ))}
        <div className="heatmap-axis">
          <div className="heatmap-room"></div>
          <div className="heatmap-cells heatmap-hours">
            {Array.from({ length: 14 }, (_, i) => <span key={i}>{i + 8}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   7) FIRST-IN / LAST-OUT PROTOCOL
// ═══════════════════════════════════════════════════════════
function FirstInLastOutPanel() {
  const recent = [
    { time: '8:28 AM', room: 'Lecture Hall 1', kind: 'first-in', detail: 'Door opened + motion detected. Fingerbot pressed lights on. AC + projector pre-warmed.' },
    { time: '11:02 AM', room: 'Tutorial Room 3', kind: 'last-out', detail: 'Presence cleared 5 min, door closed. All devices shut off.' },
    { time: '1:58 PM', room: 'Lab 3', kind: 'first-in', detail: 'Class arrived early. Auto power-on triggered.' },
  ];
  return (
    <div className="insight-card protocol-card">
      <div className="insight-card-title">🚪 First-In / Last-Out Protocol <span className="protocol-badge">ACTIVE</span></div>
      <div className="protocol-explain">
        When the first person enters a room → fingerbot presses the lights on, IR blaster pre-warms the AC.<br/>
        When the room empties → everything shuts down. Zero teacher overhead. Zero forgotten lights.
      </div>
      <div className="protocol-feed">
        {recent.map((r, i) => (
          <div key={i} className={`protocol-event ${r.kind}`}>
            <span className="protocol-time">{r.time}</span>
            <div>
              <div className="protocol-room">{r.kind === 'first-in' ? '⚡ FIRST-IN' : '🌙 LAST-OUT'} · {r.room}</div>
              <div className="protocol-detail">{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   8) ADAPTIVE SCHEDULE LEARNING
// ═══════════════════════════════════════════════════════════
function AdaptiveSchedule() {
  const recs = [
    {
      room: 'Conference Room 4',
      pattern: 'Empty during Tuesday 2-4pm for 3 consecutive weeks despite being scheduled.',
      action: 'Recommend removing this slot or making it bookable on-demand. Potential save: 4.2 kWh/week.',
    },
    {
      room: 'Lab 2',
      pattern: 'Consistently occupied 30 min after scheduled end time on Wednesdays.',
      action: 'Shift auto-shutoff back 30 min on Wednesdays. Or extend the booking.',
    },
    {
      room: 'Tutorial Room 3',
      pattern: 'Booking ends at 6 PM but AC kept running until 7:30 PM (manual override).',
      action: 'Auto-disable manual override 15 min after booking ends. Potential save: 1.8 kWh/week.',
    },
  ];
  return (
    <div className="insight-card">
      <div className="insight-card-title">🧠 Adaptive Schedule Learning</div>
      <div className="adaptive-intro">
        Kawan has been watching the timetable vs actual occupancy. Here's what doesn't match — and what to do about it.
      </div>
      <div className="adaptive-list">
        {recs.map((r, i) => (
          <div key={i} className="adaptive-row">
            <div className="adaptive-room">{r.room}</div>
            <div className="adaptive-pattern">📊 {r.pattern}</div>
            <div className="adaptive-action">💡 {r.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   9) IR COMFORT vs WASTE OPTIMIZER
// ═══════════════════════════════════════════════════════════
function IRComfortOptimizer() {
  const rooms = (window.CLASSROOMS || []).filter(r => r.appliances?.ac);
  const modeFor = (occ) => {
    if (occ === 0)    return { temp: 'OFF', mode: 'STANDBY',     reason: 'No one detected — AC off saves the most.',                  color: 'idle' };
    if (occ <= 3)     return { temp: '26°C', mode: 'ECO',         reason: 'Few people — bumping to 26°C balances comfort and savings.', color: 'eco' };
    return                  { temp: '24°C', mode: 'COMFORT',     reason: 'Full room — running at 24°C for comfort.',                  color: 'comfort' };
  };
  return (
    <div className="insight-card">
      <div className="insight-card-title">🌡️ IR Comfort vs Waste Optimizer</div>
      <div className="ir-rules">
        <div className="ir-rule"><b>0 people →</b> AC OFF</div>
        <div className="ir-rule"><b>1-3 people →</b> 26°C (ECO)</div>
        <div className="ir-rule"><b>4+ people →</b> 24°C (COMFORT)</div>
      </div>
      <div className="ir-rooms">
        {rooms.map(r => {
          const m = modeFor(r.occupancy);
          return (
            <div key={r.id} className={`ir-room ${m.color}`}>
              <div className="ir-room-head">
                <span className="ir-room-name">{r.name}</span>
                <span className={`ir-room-badge ${m.color}`}>{m.mode}</span>
              </div>
              <div className="ir-room-stats">
                <span><b>{r.occupancy}</b> people</span>
                <span className="ir-room-temp">{m.temp}</span>
              </div>
              <div className="ir-room-reason">{m.reason}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   MAIN INSIGHTS PAGE
// ═══════════════════════════════════════════════════════════
function InsightsPage() {
  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <KLSkylineSVG style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        width: '100%', opacity: 0.04, fill: 'var(--text-primary)', pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <HibiscusAccent size={20}/>
          <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 38, color: 'var(--gold)', letterSpacing: '0.05em', textShadow: 'var(--gold-glow)' }}>
            INSIGHTS
          </div>
          <HibiscusAccent size={20} style={{ transform: 'scaleX(-1)' }}/>
        </div>
        <div style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Every cool gimmick BiJAk has, in one place
        </div>
        <div className="malaysia-accent" style={{ maxWidth: 400, margin: '14px auto 0' }}></div>
      </div>

      {/* Row 1: Live status */}
      <div className="insight-row">
        <CarbonDebtTracker/>
        <PhantomLoadDetector/>
      </div>

      {/* Row 2: Vitals + Protocol */}
      <div className="insight-row">
        <ECGVitalsPanel/>
        <FirstInLastOutPanel/>
      </div>

      {/* Row 3: Heatmap + IR Optimizer */}
      <div className="insight-row">
        <OccupancyHeatmap/>
        <IRComfortOptimizer/>
      </div>

      {/* Row 4: Reports + Adaptive */}
      <div className="insight-row">
        <WastageShameLog/>
        <WeeklyReport/>
        <AdaptiveSchedule/>
      </div>
    </div>
  );
}
