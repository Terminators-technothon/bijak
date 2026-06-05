// JudgeDashboard.jsx — Live "Stage" dashboard.
// REAL Tuya wiring via Netlify Functions (tuya-status + tuya-control).
// Polls sensor status every 4s. Toggle clicks fire real device commands.
// First-In / Last-Out automation runs client-side.
// Kawan AI panel, sensor entry notifications, live sustainability stats.
//
// HARDWARE (no Zigbee — runs on what you have today):
//   Door Sensor   — WiFi
//   Motion Sensor — WiFi (PIR)
//   IR Blaster    — WiFi
//   Smart Plug 1  — WiFi
//   Smart Plug 2  — WiFi
//   BT Hub Mini   — WiFi (bridges to BT fingerbot)
//   Fingerbot     — Bluetooth, via BT Hub Mini
// SKIPPED: Tuya Zigbee presence sensor + illuminance (no Zigbee hub).

// ─────────────────────────────────────────────────────────────
// DEVICE IDS — REPLACE WITH REAL ONES FROM iot.tuya.com
// ─────────────────────────────────────────────────────────────
const STAGE_DEVICE_IDS = {
  doorSensor:    'TUYA_DOOR_STAGE',
  motionSensor:  'TUYA_MOTION_STAGE',
  device1:       'TUYA_DEVICE_1_STAGE',     // ← Fingerbot (BT, paired via BT Hub Mini)
  device2:       'TUYA_DEVICE_2_STAGE',     // ← IR Blaster (controls AC / TV)
  device3:       'TUYA_DEVICE_3_STAGE',     // ← Smart Plug 1
  device4:       'TUYA_DEVICE_4_STAGE',     // ← Smart Plug 2
  btHub:         'TUYA_BTHUB_STAGE',        // BT Hub Mini (status only, doesn't take commands)
};

// ─────────────────────────────────────────────────────────────
// DEVICE LABELS — RENAME ONCE YOU KNOW WHAT EACH CONTROLS
// Aliases let Kawan understand "turn on lights" / "AC off" / etc.
// ─────────────────────────────────────────────────────────────
const STAGE_DEVICES = [
  { key: 'device1', label: 'Device 1', icon: '🤖', deviceId: STAGE_DEVICE_IDS.device1, type: 'fingerbot', command: 'click',    subtitle: 'Bluetooth fingerbot (via BT Hub Mini)',  aliases: ['device 1', 'd1', 'fingerbot', 'switchbot', 'first device'] },
  { key: 'device2', label: 'Device 2', icon: '📡', deviceId: STAGE_DEVICE_IDS.device2, type: 'ir',        command: 'POWER',    subtitle: 'WiFi IR blaster (AC / TV remote)',        aliases: ['device 2', 'd2', 'ir', 'ac', 'tv', 'remote', 'second device'] },
  { key: 'device3', label: 'Device 3', icon: '🔌', deviceId: STAGE_DEVICE_IDS.device3, type: 'switch',    command: 'switch_1', subtitle: 'WiFi smart plug — assign on stage',       aliases: ['device 3', 'd3', 'plug 1', 'plug one', 'third device'] },
  { key: 'device4', label: 'Device 4', icon: '🔌', deviceId: STAGE_DEVICE_IDS.device4, type: 'switch',    command: 'switch_1', subtitle: 'WiFi smart plug — assign on stage',       aliases: ['device 4', 'd4', 'plug 2', 'plug two', 'fourth device'] },
];

// Real Malaysia constants
const STAGE_CO2_KWH = 0.694;
const STAGE_TNB_RM  = 0.218;

// Approx watts per device (used for session savings counter)
const STAGE_DEVICE_WATTS = { device1: 320, device2: 300, device3: 80, device4: 80 };

// How long after the last motion event we consider the stage "occupied"
const MOTION_OCCUPANCY_WINDOW_MS = 60 * 1000;

function JudgeDashboard() {
  const [deviceStates, setDeviceStates] = React.useState({ device1: false, device2: false, device3: false, device4: false });
  const [sensors,      setSensors]      = React.useState({ door: 'closed', motion: 'clear', lastMotionAt: 0, lastDoorAt: 0 });
  const [log,          setLog]          = React.useState([{ time: 'just now', text: 'BiJAk is online. Watching the Stage.', kind: 'info' }]);
  const [protocolActive, setProtocolActive] = React.useState(true);
  const [toasts,       setToasts]       = React.useState([]);
  const [savedKwh,     setSavedKwh]     = React.useState(0);
  const [now,          setNow]          = React.useState(Date.now());
  const sessionStartRef  = React.useRef(Date.now());
  const interventionsRef = React.useRef(0);

  // Tick `now` every second for derived state (occupancy etc.)
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Helpers ──
  const pushLog = (text, kind = 'info') => {
    setLog(prev => [
      { time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text, kind },
      ...prev.slice(0, 49),
    ]);
  };

  const pushToast = (kind, title, body) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, kind, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5500);
  };

  const sendCommand = async (deviceId, command, value) => {
    try {
      const res = await fetch('/.netlify/functions/tuya-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, command, value }),
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // Helper used by both manual toggles AND Kawan-driven commands.
  const fireDeviceCommand = async (dev, targetOn, fromKawan = false) => {
    pushLog(`${fromKawan ? '🗣️ Kawan ' : ''}→ ${dev.label} ${targetOn ? 'ON' : 'OFF'}`, 'action');
    setDeviceStates(s => ({ ...s, [dev.key]: targetOn }));

    let cmd, val;
    if (dev.type === 'fingerbot') { cmd = 'click'; val = true; }
    else if (dev.type === 'ir')   { cmd = 'ir';    val = { command: dev.command }; }
    else                          { cmd = dev.command; val = targetOn; }

    const result = await sendCommand(dev.deviceId, cmd, val);
    if (result.ok) {
      pushLog(`✓ ${dev.label} ${targetOn ? 'on' : 'off'} ${result.mock ? '(mock)' : '(live)'}`, 'success');
      if (!targetOn) {
        interventionsRef.current += 1;
        setSavedKwh(k => k + (STAGE_DEVICE_WATTS[dev.key] || 200) / 1000 * 0.25);   // ~15 min of waste prevented per off
      }
    } else {
      pushLog(`✗ ${dev.label} failed — ${result.error || 'unknown'}`, 'warn');
      setDeviceStates(s => ({ ...s, [dev.key]: !targetOn }));
    }
  };

  const deviceStatesRef = React.useRef(deviceStates);
  React.useEffect(() => { deviceStatesRef.current = deviceStates; }, [deviceStates]);

  // ── Poll Tuya every 4 sec: door + motion only ──
  React.useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const [doorRes, motionRes] = await Promise.all([
          fetch('/.netlify/functions/tuya-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: STAGE_DEVICE_IDS.doorSensor }) }).then(r => r.json()),
          fetch('/.netlify/functions/tuya-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: STAGE_DEVICE_IDS.motionSensor }) }).then(r => r.json()),
        ]);
        if (!alive) return;

        const doorOpen = readBool(doorRes.status, 'doorcontact_state', 'door');
        const motionOn = readMotion(motionRes.status);

        setSensors(prev => {
          const next = {
            door:         doorOpen ? 'open'      : 'closed',
            motion:       motionOn ? 'detected'  : 'clear',
            lastMotionAt: motionOn ? Date.now() : prev.lastMotionAt,
            lastDoorAt:   doorOpen ? Date.now() : prev.lastDoorAt,
          };

          // Sensor entry notifications
          if (prev.door !== 'open' && next.door === 'open') {
            pushToast('entry', '🚪 Door opened', 'Someone just entered the Stage.');
          }
          if (prev.motion === 'clear' && next.motion === 'detected') {
            pushToast('entry', '🚶 Motion detected', 'Movement on stage.');
          }
          if (prev.motion === 'detected' && next.motion === 'clear') {
            pushLog('Motion cleared', 'info');
          }
          if (prev.door === 'open' && next.door === 'closed') {
            pushLog('Door closed', 'info');
          }

          // First-In / Last-Out protocol triggers
          if (protocolActive) {
            const anyDeviceOn = Object.values(deviceStatesRef.current).some(Boolean);
            // FIRST-IN: door just opened AND motion is active → power on Devices 1+2
            if (prev.door !== 'open' && next.door === 'open' && motionOn && !anyDeviceOn) {
              triggerProtocol('first-in');
            }
            // LAST-OUT: motion just cleared, door is closed, devices are on → power down
            if (prev.motion === 'detected' && next.motion === 'clear' && next.door === 'closed' && anyDeviceOn) {
              triggerProtocol('last-out');
            }
          }
          return next;
        });
      } catch { /* swallow */ }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => { alive = false; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocolActive]);

  const triggerProtocol = async (mode) => {
    if (mode === 'first-in') {
      pushLog('🚪 First-In Protocol — entry detected', 'protocol');
      pushToast('protocol', '⚡ FIRST-IN PROTOCOL', 'Auto-activating devices for arrival.');
      for (const dev of STAGE_DEVICES.slice(0, 2)) {     // turn on first two devices
        await fireDeviceCommand(dev, true);
      }
    } else {
      pushLog('🌙 Last-Out Protocol — room empty', 'protocol');
      pushToast('protocol', '🌙 LAST-OUT PROTOCOL', 'Stage vacant — shutting all devices down.');
      for (const dev of STAGE_DEVICES) {
        if (!deviceStatesRef.current[dev.key]) continue;
        await fireDeviceCommand(dev, false);
      }
    }
  };

  // Tiny passive "we're watching" savings tick — counter feels alive
  React.useEffect(() => {
    const id = setInterval(() => setSavedKwh(k => k + 0.0008), 2000);
    return () => clearInterval(id);
  }, []);

  // ── Derived values ──
  const sessionMinutes = Math.floor((Date.now() - sessionStartRef.current) / 60000);
  const co2Saved = savedKwh * STAGE_CO2_KWH;
  const rmSaved  = savedKwh * STAGE_TNB_RM;

  // Inferred occupancy: motion right now, OR motion in last 60s, OR door opened in last 60s
  const recentlyActive = (now - sensors.lastMotionAt) < MOTION_OCCUPANCY_WINDOW_MS
                      || (now - sensors.lastDoorAt)   < MOTION_OCCUPANCY_WINDOW_MS;
  const occupied = sensors.motion === 'detected' || recentlyActive;

  const activePhantom = !occupied && Object.values(deviceStates).some(Boolean);
  const stageState = {
    devices: STAGE_DEVICES.map(d => ({ label: d.label, key: d.key, on: deviceStates[d.key] })),
    sensors: { door: sensors.door, motion: sensors.motion },
    occupied,
    sessionMinutes,
    interventions: interventionsRef.current,
    savedKwh, co2Saved, rmSaved,
    activePhantom,
    someoneEntered: sensors.door === 'open' || sensors.motion === 'detected',
  };

  return (
    <div className="judge-app">
      <div className="judge-spotlight judge-spotlight-l"></div>
      <div className="judge-spotlight judge-spotlight-r"></div>

      {/* HEADER */}
      <header className="judge-header">
        <div className="judge-brand">
          <div className="judge-brand-name">BiJAk · LIVE 🌱</div>
          <div className="judge-brand-sub">Real hardware · Real savings · Real-time</div>
        </div>
        <div className="judge-status">
          <div className={`judge-status-dot ${occupied ? 'live' : 'idle'}`}></div>
          <div className="judge-status-text">
            {occupied ? 'OCCUPIED' : 'VACANT'} · session {sessionMinutes}m
          </div>
        </div>
      </header>

      {/* SUSTAINABILITY HERO BANNER */}
      <SustainabilityHero kwh={savedKwh} co2={co2Saved} rm={rmSaved} interventions={interventionsRef.current}/>

      {/* MAIN GRID */}
      <div className="judge-grid">
        {/* Devices */}
        <section className="judge-panel">
          <div className="judge-panel-title">⚡ Device Controls</div>
          <div className="judge-rename-hint">💡 Rename Device 1–4 in JudgeDashboard.jsx → STAGE_DEVICES once you know what they're connected to.</div>
          <div className="judge-devices">
            {STAGE_DEVICES.map(dev => (
              <button key={dev.key} className={`judge-device ${deviceStates[dev.key] ? 'on' : ''}`} onClick={() => fireDeviceCommand(dev, !deviceStates[dev.key])}>
                <span className="judge-device-icon">{dev.icon}</span>
                <div className="judge-device-info">
                  <div className="judge-device-label">{dev.label}</div>
                  <div className="judge-device-sub">{dev.subtitle}</div>
                </div>
                <div className={`judge-device-state ${deviceStates[dev.key] ? 'on' : 'off'}`}>
                  {deviceStates[dev.key] ? 'ON' : 'OFF'}
                </div>
              </button>
            ))}
          </div>

          <div className="judge-protocol">
            <div className="judge-protocol-row">
              <div className="judge-protocol-title">First-In / Last-Out Protocol</div>
              <button
                className={`judge-protocol-toggle ${protocolActive ? 'on' : 'off'}`}
                onClick={() => setProtocolActive(p => !p)}>
                {protocolActive ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>
            <div className="judge-protocol-sub">
              Door opens + motion detected → Devices 1 & 2 auto-on. Motion clears + door closed → everything off.
            </div>
          </div>
        </section>

        {/* Sensors */}
        <section className="judge-panel">
          <div className="judge-panel-title">📡 Live Sensors</div>
          <div className="judge-sensors">
            <SensorPill icon="🚪" label="Door"      value={sensors.door}                  good="closed"/>
            <SensorPill icon="🚶" label="Motion"    value={sensors.motion}                good="clear"/>
            <SensorPill icon="👤" label="Occupancy" value={occupied ? 'occupied' : 'vacant'} good="vacant"/>
            <SensorPill icon="⏱️" label="Session"   value={`${sessionMinutes}m`}          good="any"/>
          </div>

          <div className="judge-panel-sub-title" style={{ marginTop: 22 }}>Hardware</div>
          <div className="judge-hardware-list">
            <HwRow label="BT Hub Mini"    status="online"/>
            <HwRow label="Door Sensor"    status={sensors.door}/>
            <HwRow label="Motion Sensor"  status={sensors.motion}/>
            {STAGE_DEVICES.map(d => (
              <HwRow key={d.key} label={d.label} status={deviceStates[d.key] ? 'ON' : 'OFF'}/>
            ))}
          </div>
        </section>

        {/* Activity log */}
        <section className="judge-panel">
          <div className="judge-panel-title">📜 Activity Log</div>
          <div className="judge-log">
            {log.map((e, i) => (
              <div key={i} className={`judge-log-row ${e.kind}`}>
                <span className="judge-log-time">{e.time}</span>
                <span className="judge-log-text">{e.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* KAWAN AI PANEL */}
      <JudgeKawan
        stageState={stageState}
        devices={STAGE_DEVICES}
        deviceStates={deviceStates}
        onFireCommand={fireDeviceCommand}
        onLog={pushLog}
      />

      {/* TOASTS */}
      <div className="judge-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`judge-toast ${t.kind}`}>
            <div className="judge-toast-title">{t.title}</div>
            <div className="judge-toast-body">{t.body}</div>
          </div>
        ))}
      </div>

      <footer className="judge-footer">
        BiJAk is a student project developed for UM Technothon 2026 by Team Terminators.
        Built for demonstration purposes only.
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero banner — live tickers
// ─────────────────────────────────────────────────────────────
function SustainabilityHero({ kwh, co2, rm, interventions }) {
  return (
    <div className="judge-hero">
      <div className="judge-hero-leaf">🌿</div>
      <div className="judge-hero-stats">
        <HeroStat val={kwh.toFixed(3)}        unit="kWh" label="energy saved"   trend={kwh > 0 ? 'live' : ''}/>
        <HeroStat val={co2.toFixed(3)}        unit="kg"  label="CO₂ prevented"  tone="green"/>
        <HeroStat val={'RM ' + rm.toFixed(2)} unit=""    label="cost recovered" tone="gold"/>
        <HeroStat val={interventions}         unit=""    label="interventions"  tone="gold"/>
      </div>
      <div className="judge-hero-tag">SUSTAINABILITY · LIVE FROM STAGE</div>
    </div>
  );
}

function HeroStat({ val, unit, label, trend, tone }) {
  return (
    <div className={`judge-hero-stat ${tone || ''} ${trend ? 'live' : ''}`}>
      <div className="judge-hero-val">{val}<span className="judge-hero-unit">{unit ? ' ' + unit : ''}</span></div>
      <div className="judge-hero-label">{label}</div>
    </div>
  );
}

function SensorPill({ icon, label, value, good }) {
  const isGood = good === 'any' || value === good || (typeof value === 'string' && value.includes(good));
  return (
    <div className={`sensor-pill ${isGood ? 'idle' : 'active'}`}>
      <div className="sensor-pill-icon">{icon}</div>
      <div className="sensor-pill-label">{label}</div>
      <div className="sensor-pill-value">{value}</div>
    </div>
  );
}

function HwRow({ label, status }) {
  return (
    <div className="judge-hw-row">
      <span className="judge-hw-label">{label}</span>
      <span className="judge-hw-status">{status}</span>
    </div>
  );
}

// Tuya status parsers
function readBool(status, ...keys) {
  if (!Array.isArray(status)) return false;
  for (const k of keys) {
    const it = status.find(s => s.code === k);
    if (it) return !!it.value;
  }
  return false;
}
function readMotion(status) {
  if (!Array.isArray(status)) return false;
  const it = status.find(s => s.code === 'pir' || s.code === 'motion_state');
  if (!it) return false;
  const v = it.value;
  return v === 'pir' || v === 'motion' || v === true;
}
