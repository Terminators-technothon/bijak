// HomeDashboard.jsx — Google-Home-style customisable dashboard.
// • Widget picker (toggle any of 10 widgets on/off)
// • Classroom CRUD (add new rooms, hide default ones, edit name/devices)
// • Per-classroom device toggles (door, motion, fingerbot, IR, smart plug/switch)
// • Everything persisted in localStorage so it survives reloads
// • Reuses existing widgets: StatBar, ClassroomCard, Leaderboard (Dashboard.jsx)
//                            CarbonDebtTracker, WastageShameLog, PhantomLoadDetector,
//                            WeeklyReport, ECGVitalsPanel, OccupancyHeatmap (InsightsPage.jsx)

// ═══════════════════════════════════════════════════════════
//   localStorage-backed prefs
// ═══════════════════════════════════════════════════════════
function useUMPref(key, defaultValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch { return defaultValue; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

// All available widgets — defines order they render in
const WIDGETS = [
  { id: 'liveStats',    label: 'Live Energy Savings + CO₂ Counter',  defaultOn: true,  size: 'full' },
  { id: 'classrooms',   label: 'Classroom Cards',                     defaultOn: true,  size: 'full' },
  { id: 'occupancy',    label: 'Occupancy Status Summary',            defaultOn: false, size: 'half' },
  { id: 'carbonDebt',   label: 'Live Carbon Debt Tracker',            defaultOn: true,  size: 'half' },
  { id: 'phantom',      label: 'Phantom Load Detector',               defaultOn: true,  size: 'half' },
  { id: 'shameLog',     label: 'Wastage Shame Log',                   defaultOn: true,  size: 'half' },
  { id: 'weekly',       label: "Kawan's Weekly Sustainability Report", defaultOn: false, size: 'half' },
  { id: 'ecg',          label: 'Classroom Vitals ECG',                defaultOn: false, size: 'half' },
  { id: 'leaderboard',  label: 'Efficiency Leaderboard',              defaultOn: true,  size: 'full' },
  { id: 'quickActions', label: 'Quick Actions',                       defaultOn: true,  size: 'full' },
];

// Devices a classroom may have
const DEVICE_TYPES = [
  { key: 'doorSensor',   label: 'Door Sensor',   emoji: '🚪' },
  { key: 'motionSensor', label: 'Motion Sensor', emoji: '👋' },
  { key: 'fingerbot',    label: 'Fingerbot',     emoji: '🤖' },
  { key: 'irBlaster',    label: 'IR Blaster',    emoji: '📡' },
  { key: 'smartPlug',    label: 'Smart Plug',    emoji: '🔌' },
  { key: 'smartSwitch',  label: 'Smart Switch',  emoji: '💡' },
];

const defaultWidgetPrefs = () => Object.fromEntries(WIDGETS.map(w => [w.id, w.defaultOn]));
const defaultDevicePrefs = () => Object.fromEntries(DEVICE_TYPES.map(d => [d.key, true]));

// ═══════════════════════════════════════════════════════════
//   SETTINGS MODAL
// ═══════════════════════════════════════════════════════════
function DashboardSettings({ open, onClose, widgetPrefs, setWidgetPrefs, customRooms, setCustomRooms, hiddenRooms, setHiddenRooms, devicePrefs, setDevicePrefs }) {
  const [tab, setTab] = React.useState('widgets');
  const [showAdd, setShowAdd] = React.useState(false);

  if (!open) return null;

  const allRooms = [...(window.CLASSROOMS || []), ...customRooms];

  const toggleWidget = (id) => setWidgetPrefs(p => ({ ...p, [id]: !p[id] }));
  const toggleHide   = (id) => setHiddenRooms(h => h.includes(id) ? h.filter(x => x !== id) : [...h, id]);
  const removeCustom = (id) => setCustomRooms(rs => rs.filter(r => r.id !== id));
  const toggleDevice = (roomId, deviceKey) => {
    setDevicePrefs(p => {
      const room = p[roomId] || defaultDevicePrefs();
      return { ...p, [roomId]: { ...room, [deviceKey]: !room[deviceKey] } };
    });
  };

  const resetAll = () => {
    if (!confirm('Reset all dashboard preferences to defaults?')) return;
    setWidgetPrefs(defaultWidgetPrefs());
    setCustomRooms([]);
    setHiddenRooms([]);
    setDevicePrefs({});
  };

  return (
    <div className="settings-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="settings-modal">
        <div className="settings-modal-head">
          <div className="settings-modal-title">⚙️ Customise Dashboard</div>
          <button className="settings-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-tabs">
          <button className={`settings-tab ${tab === 'widgets'    ? 'active' : ''}`} onClick={() => setTab('widgets')}>Widgets</button>
          <button className={`settings-tab ${tab === 'classrooms' ? 'active' : ''}`} onClick={() => setTab('classrooms')}>Classrooms</button>
          <button className={`settings-tab ${tab === 'devices'    ? 'active' : ''}`} onClick={() => setTab('devices')}>Devices</button>
        </div>

        <div className="settings-tab-content">
          {tab === 'widgets' && (
            <div>
              <div className="settings-explain">Toggle which widgets appear on your home dashboard.</div>
              {WIDGETS.map(w => (
                <div key={w.id} className="settings-row">
                  <div className="settings-row-label">{w.label}</div>
                  <button
                    className={`settings-toggle ${widgetPrefs[w.id] ? 'on' : ''}`}
                    onClick={() => toggleWidget(w.id)}>
                    <span className="settings-toggle-knob"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'classrooms' && (
            <div>
              <div className="settings-explain">Add new classrooms or hide the default ones. Custom rooms can be fully removed.</div>
              {allRooms.map(r => (
                <div key={r.id} className="settings-room-row">
                  <div className="settings-room-info">
                    <div className="settings-room-name">{r.name}</div>
                    <div className="settings-room-meta">{r.dept || r.building || 'Custom classroom'} · capacity {r.capacity || '?'}</div>
                  </div>
                  <div className="settings-room-actions">
                    {customRooms.find(c => c.id === r.id)
                      ? <button className="settings-mini-btn danger" onClick={() => removeCustom(r.id)}>Delete</button>
                      : (
                        <button
                          className={`settings-mini-btn ${hiddenRooms.includes(r.id) ? 'on' : ''}`}
                          onClick={() => toggleHide(r.id)}>
                          {hiddenRooms.includes(r.id) ? 'Show' : 'Hide'}
                        </button>
                      )}
                  </div>
                </div>
              ))}

              {showAdd
                ? <AddClassroomForm onAdd={(newRoom) => { setCustomRooms(rs => [...rs, newRoom]); setShowAdd(false); }} onCancel={() => setShowAdd(false)}/>
                : <button className="add-classroom-btn" onClick={() => setShowAdd(true)}>+ Add Classroom</button>}
            </div>
          )}

          {tab === 'devices' && (
            <div>
              <div className="settings-explain">Per-classroom: which Tuya devices are installed. Unchecked = hidden from the room's UI.</div>
              {allRooms.map(r => {
                const dp = devicePrefs[r.id] || defaultDevicePrefs();
                return (
                  <div key={r.id} className="settings-device-room">
                    <div className="settings-device-room-name">{r.name}</div>
                    <div className="settings-device-checks">
                      {DEVICE_TYPES.map(d => (
                        <label key={d.key} className={`settings-device-check ${dp[d.key] ? 'on' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!dp[d.key]}
                            onChange={() => toggleDevice(r.id, d.key)}/>
                          <span>{d.emoji} {d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="settings-modal-foot">
          <button className="settings-mini-btn danger" onClick={resetAll}>Reset all</button>
          <div style={{ flex: 1 }}/>
          <button className="settings-mini-btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function AddClassroomForm({ onAdd, onCancel }) {
  const [name, setName] = React.useState('');
  const [dept, setDept] = React.useState('');
  const [capacity, setCapacity] = React.useState(30);
  const submit = () => {
    if (!name.trim()) return;
    const id = 'custom-' + Date.now();
    onAdd({
      id, name: name.trim(),
      dept: dept.trim() || 'Custom',
      building: 'Custom',
      capacity: Math.max(1, parseInt(capacity, 10) || 30),
      status: 'empty',
      occupancy: 0,
      efficiency: 75,
      appliances: { ac: false, projector: false, lights: false, outlets: false },
      acTemp: null, brightness: 0,
      energyToday: 0, energyYesterday: 0,
      rmSaved: 0, wasteEvents: 0,
      nextClass: null, currentClass: null,
      schedule: [],
      sensorFeed: [{ time: 'Just now', text: 'Classroom added to dashboard', type: 'success', icon: '✨' }],
    });
  };
  return (
    <div className="settings-add-form">
      <div className="settings-add-row">
        <label>Name <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Music Studio"/></label>
        <label>Faculty / Dept <input value={dept} onChange={e => setDept(e.target.value)} placeholder="e.g. Arts"/></label>
        <label>Capacity <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)}/></label>
      </div>
      <div className="settings-add-actions">
        <button className="settings-mini-btn" onClick={onCancel}>Cancel</button>
        <button className="settings-mini-btn primary" onClick={submit}>Add</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   Mini widgets specific to HomeDashboard
// ═══════════════════════════════════════════════════════════

// Quick stat bar — reuses the look of the existing Dashboard StatBar
function HomeStatBar() {
  const [stats, setStats] = React.useState({ kwh: 32.1, rm: 146.80, co2: 16.05, alerts: 2 });
  React.useEffect(() => {
    const id = setInterval(() => {
      setStats(s => ({
        kwh: +(s.kwh + Math.random() * 0.04).toFixed(2),
        rm:  +(s.rm  + Math.random() * 0.18).toFixed(2),
        co2: +(s.co2 + Math.random() * 0.02).toFixed(2),
        alerts: s.alerts,
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  const items = [
    { v: stats.kwh.toFixed(1),     l: 'kWh Saved Today' },
    { v: 'RM ' + stats.rm.toFixed(2), l: 'Cost Saved Today' },
    { v: stats.co2.toFixed(1) + ' kg', l: 'CO₂ Prevented' },
    { v: stats.alerts,             l: 'Active Waste Alerts', alert: stats.alerts > 0 },
  ];
  return (
    <div className="home-statbar">
      {items.map((it, i) => (
        <div key={i} className="home-statbar-item">
          <div className={`home-statbar-val ${it.alert ? 'alert' : ''}`}>{it.v}</div>
          <div className="home-statbar-label">{it.l}</div>
        </div>
      ))}
    </div>
  );
}

// Compact occupancy status summary widget
function OccupancySummary({ rooms }) {
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const empty    = rooms.filter(r => r.status === 'empty').length;
  const waste    = rooms.filter(r => r.status === 'waste').length;
  const soon     = rooms.filter(r => r.status === 'soon').length;
  const totalPeople = rooms.reduce((s, r) => s + (r.occupancy || 0), 0);
  return (
    <div className="insight-card">
      <div className="insight-card-title">👥 Occupancy Right Now</div>
      <div className="occ-big-num">{totalPeople}</div>
      <div className="occ-big-label">people across campus</div>
      <div className="occ-row">
        <span className="occ-pill occupied">🟢 {occupied} occupied</span>
        <span className="occ-pill soon">🟡 {soon} soon</span>
        <span className="occ-pill empty">⚫ {empty} empty</span>
        {waste > 0 && <span className="occ-pill waste">⚠️ {waste} wasting</span>}
      </div>
    </div>
  );
}

// Filtered classroom card that respects per-room device prefs
function FilteredClassroomCard({ room, onClick, devicePrefs }) {
  const prefs = devicePrefs[room.id] || defaultDevicePrefs();
  // Map device prefs to appliance keys (door/motion etc don't directly map to appliances).
  // Filter the existing appliance icons: smartSwitch hides lights, smartPlug hides outlets,
  // fingerbot enables auto-light, irBlaster controls ac+projector.
  const appliances = { ...room.appliances };
  if (!prefs.smartSwitch && !prefs.fingerbot) appliances.lights = false;
  if (!prefs.smartPlug) appliances.outlets = false;
  if (!prefs.irBlaster) { appliances.ac = false; appliances.projector = false; }
  return <ClassroomCard room={{ ...room, appliances }} onClick={onClick}/>;
}

// ═══════════════════════════════════════════════════════════
//   MAIN HomeDashboard
// ═══════════════════════════════════════════════════════════
function HomeDashboard({ onSelectRoom }) {
  const [widgetPrefs, setWidgetPrefs] = useUMPref('um_widget_prefs',  defaultWidgetPrefs());
  const [customRooms, setCustomRooms] = useUMPref('um_custom_rooms',  []);
  const [hiddenRooms, setHiddenRooms] = useUMPref('um_hidden_rooms',  []);
  const [devicePrefs, setDevicePrefs] = useUMPref('um_device_prefs',  {});
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Merged room list — defaults minus hidden, plus customs
  const allRooms = React.useMemo(() => {
    const defaults = (window.CLASSROOMS || []).filter(r => !hiddenRooms.includes(r.id));
    return [...defaults, ...customRooms];
  }, [hiddenRooms, customRooms]);

  const show = (id) => widgetPrefs[id];

  const handleQuickAction = (msg) => {
    // Re-fire a toast via window event so the Dashboard's toast wiring still works,
    // or just alert for now since toasts are inside Dashboard.jsx.
    console.log('Quick action:', msg);
  };

  return (
    <div className="home-dashboard">
      {/* Header */}
      <div className="home-dash-header">
        <div>
          <div className="home-dash-title">⌂ Home</div>
          <div className="home-dash-sub">
            {allRooms.length} classroom{allRooms.length !== 1 ? 's' : ''} · {Object.values(widgetPrefs).filter(Boolean).length} of {WIDGETS.length} widgets visible
          </div>
        </div>
        <button className="home-settings-btn" onClick={() => setSettingsOpen(true)} title="Customise dashboard">
          ⚙️ Customise
        </button>
      </div>

      {/* Widget grid */}
      <div className="home-dash-grid">

        {show('liveStats') && (
          <div className="home-widget full">
            <HomeStatBar/>
          </div>
        )}

        {show('occupancy') && (
          <div className="home-widget half"><OccupancySummary rooms={allRooms}/></div>
        )}

        {show('carbonDebt') && (
          <div className="home-widget half"><CarbonDebtTracker/></div>
        )}

        {show('phantom') && (
          <div className="home-widget half"><PhantomLoadDetector/></div>
        )}

        {show('shameLog') && (
          <div className="home-widget half"><WastageShameLog/></div>
        )}

        {show('weekly') && (
          <div className="home-widget half"><WeeklyReport/></div>
        )}

        {show('ecg') && (
          <div className="home-widget half"><ECGVitalsPanel/></div>
        )}

        {show('classrooms') && (
          <div className="home-widget full">
            <div className="home-widget-title">📚 Live Classroom Monitor</div>
            {allRooms.length === 0
              ? <EmptyClassrooms onSettings={() => setSettingsOpen(true)}/>
              : (
                <div className="classroom-grid">
                  {allRooms.map(r => (
                    <FilteredClassroomCard
                      key={r.id}
                      room={r}
                      onClick={() => onSelectRoom(r.id)}
                      devicePrefs={devicePrefs}
                    />
                  ))}
                </div>
              )}
          </div>
        )}

        {show('quickActions') && (
          <div className="home-widget full">
            <div className="home-widget-title">⚡ Quick Actions</div>
            <div className="quick-actions">
              <button className="quick-btn danger" onClick={() => handleQuickAction('Shutting down empty rooms')}>
                🔴 Shut Down All Empty Rooms
              </button>
              <button className="quick-btn" onClick={() => handleQuickAction('Preparing rooms')}>
                💛 Prepare Rooms for Next Class
              </button>
              <button className="quick-btn" onClick={() => handleQuickAction('Generating report')}>
                📊 Today's Waste Report
              </button>
            </div>
          </div>
        )}

        {show('leaderboard') && (
          <div className="home-widget full">
            <Leaderboard/>
          </div>
        )}

      </div>

      <DashboardSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        widgetPrefs={widgetPrefs}   setWidgetPrefs={setWidgetPrefs}
        customRooms={customRooms}   setCustomRooms={setCustomRooms}
        hiddenRooms={hiddenRooms}   setHiddenRooms={setHiddenRooms}
        devicePrefs={devicePrefs}   setDevicePrefs={setDevicePrefs}
      />
    </div>
  );
}

function EmptyClassrooms({ onSettings }) {
  return (
    <div className="empty-classrooms">
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
      <div style={{ fontFamily: 'Archivo Black', fontSize: 16, color: 'var(--gold)', marginBottom: 6 }}>
        No classrooms here yet
      </div>
      <div style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
        Add one in settings, or unhide the defaults.
      </div>
      <button className="settings-mini-btn primary" onClick={onSettings}>Open Settings →</button>
    </div>
  );
}
