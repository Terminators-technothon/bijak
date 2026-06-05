// JudgeKawan.jsx — 3D Kawan + chat + AI device control for the judge dashboard.
// Posts to /.netlify/functions/judge-kawan (stage-themed system prompt).
// Detects "turn on/off X" commands in plain English and fires Tuya commands BEFORE asking Kawan to confirm.

const KAWAN_OBJ_PATH_JUDGE_KAWAN = 'kawan 3d model/Meshy_AI_Petronas_Orb_Bot_0427074620_texture_obj/Meshy_AI_Petronas_Orb_Bot_0427074620_texture.obj';
const KAWAN_MTL_PATH_JUDGE_KAWAN = 'kawan 3d model/Meshy_AI_Petronas_Orb_Bot_0427074620_texture_obj/Meshy_AI_Petronas_Orb_Bot_0427074620_texture.mtl';

// Intent parser — detects natural-language device commands.
function parseDeviceIntent(message, devices) {
  const text = (message || '').toLowerCase().trim();
  if (!text) return null;

  const isOn     = /\b(turn on|switch on|enable|activate|start|power on|open)\b/.test(text);
  const isOff    = /\b(turn off|switch off|disable|deactivate|stop|kill|shut down|shutdown|power off|close)\b/.test(text);
  const isToggle = /\btoggle\b/.test(text) && !isOn && !isOff;
  if (!isOn && !isOff && !isToggle) return null;

  // Match a device by label or by any alias (case-insensitive).
  for (const dev of devices) {
    const labels = [dev.label, dev.key, ...(dev.aliases || [])].filter(Boolean);
    for (const l of labels) {
      if (text.includes(l.toLowerCase())) {
        return { device: dev, action: isOn ? 'on' : isOff ? 'off' : 'toggle' };
      }
    }
  }

  // "Turn off all / everything" applies to all devices.
  if (/\b(all|everything)\b/.test(text)) {
    return { device: 'all', action: isOn ? 'on' : isOff ? 'off' : 'toggle' };
  }
  return null;
}

function JudgeKawan({ stageState, devices, deviceStates, onFireCommand, onLog }) {
  const stageRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const [mood, setMood]         = React.useState('idle');
  const [messages, setMessages] = React.useState([
    { role: 'kawan', text: "Hey judge! I'm KAWAN. Ask me anything — or just say 'turn on Device 1' and I'll do it." },
  ]);
  const [input, setInput]       = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const stripRef = React.useRef(null);

  // Auto-scroll on new message
  React.useEffect(() => {
    if (stripRef.current) stripRef.current.scrollTop = stripRef.current.scrollHeight;
  }, [messages, thinking]);

  // Mood derivation from stage state
  React.useEffect(() => {
    if (stageState?.activePhantom) setMood('alert');
    else if (thinking)             setMood('responding');
    else if (stageState?.someoneEntered) setMood('class-starting');
    else                           setMood('idle');
  }, [stageState, thinking]);

  // ── Three.js scene ──
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof THREE === 'undefined') return;

    const w = stage.clientWidth, h = stage.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    stage.appendChild(renderer.domElement);

    // Stage-themed lights: warm gold key + maroon fill
    const key  = new THREE.DirectionalLight(0xFFC72C, 1.3); key.position.set(2, 2, 3);
    const fill = new THREE.DirectionalLight(0x8B2A3F, 0.6); fill.position.set(-2, -1, 2);
    const amb  = new THREE.AmbientLight(0xFFF6E8, 0.5);
    scene.add(key, fill, amb);

    const placeholder = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshStandardMaterial({ color: 0xFFC72C, wireframe: true, emissive: 0xFFC72C, emissiveIntensity: 0.55 })
    );
    scene.add(placeholder);
    let object = placeholder;

    if (typeof THREE.MTLLoader === 'function' && typeof THREE.OBJLoader === 'function') {
      try {
        new THREE.MTLLoader().load(KAWAN_MTL_PATH_JUDGE_KAWAN, (mats) => {
          mats.preload();
          new THREE.OBJLoader().setMaterials(mats).load(KAWAN_OBJ_PATH_JUDGE_KAWAN, (root) => {
            const box = new THREE.Box3().setFromObject(root);
            const size = new THREE.Vector3(); box.getSize(size);
            const center = new THREE.Vector3(); box.getCenter(center);
            const scale = 1.8 / Math.max(size.x, size.y, size.z);
            root.scale.setScalar(scale);
            root.position.sub(center.multiplyScalar(scale));
            scene.remove(placeholder);
            scene.add(root);
            object = root;
          });
        });
      } catch (e) { /* keep placeholder */ }
    }

    let dragging = false, lastX = 0, lastY = 0;
    let manualRY = 0, manualRX = 0, autoSpinRY = 0;
    const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onMove = (e) => {
      if (!dragging) return;
      manualRY += (e.clientX - lastX) * 0.01;
      manualRX += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = () => { dragging = false; };
    stage.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    stage.addEventListener('touchstart', (e) => { onDown(e.touches[0]); });
    window.addEventListener('touchmove',  (e) => { onMove(e.touches[0]); });
    window.addEventListener('touchend',   onUp);

    sceneRef.current = { scene, camera, renderer, getObject: () => object, getMood: () => mood };

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const m = sceneRef.current.getMood();
      let spin = 0.010, wobble = 0, bounce = 0;
      if (m === 'idle')             spin = 0.010;
      if (m === 'responding')      { spin = 0.025; bounce = Math.sin(performance.now() * 0.005) * 0.06; }
      if (m === 'alert')           { spin = 0.030; wobble = Math.sin(performance.now() * 0.025) * 0.18; }
      if (m === 'class-starting') { spin = 0.020; bounce = Math.sin(performance.now() * 0.008) * 0.08; }
      autoSpinRY += spin;
      const obj = sceneRef.current.getObject();
      obj.rotation.y = autoSpinRY + manualRY + wobble;
      obj.rotation.x = manualRX;
      obj.position.y = bounce;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const ww = stage.clientWidth, hh = stage.clientHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('resize',    onResize);
      try { renderer.dispose(); stage.removeChild(renderer.domElement); } catch {}
    };
  }, []);

  React.useEffect(() => {
    if (sceneRef.current) sceneRef.current.getMood = () => mood;
  }, [mood]);

  // Send to Kawan (with optional fired command context)
  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);

    // Intent detection — if the user is asking to control a device, fire it BEFORE asking Kawan.
    let justFired = null;
    const intent = parseDeviceIntent(text, devices);
    if (intent) {
      if (intent.device === 'all') {
        // Fire all devices in the chosen direction
        const desired = intent.action === 'toggle' ? null : (intent.action === 'on');
        for (const dev of devices) {
          const target = desired == null ? !deviceStates[dev.key] : desired;
          onFireCommand(dev, target, /* fromKawan */ true);
        }
        justFired = { devices: 'ALL', action: intent.action };
        onLog?.(`🗣️ Kawan: firing ${intent.action.toUpperCase()} on all devices`, 'protocol');
      } else {
        const dev = intent.device;
        const current = deviceStates[dev.key];
        const target = intent.action === 'toggle' ? !current
                     : intent.action === 'on'     ? true
                     :                              false;
        onFireCommand(dev, target, /* fromKawan */ true);
        justFired = { device: dev.label, action: target ? 'on' : 'off' };
        onLog?.(`🗣️ Kawan: ${target ? 'turning ON' : 'turning OFF'} ${dev.label}`, 'protocol');
      }
    }

    try {
      const res = await fetch('/.netlify/functions/judge-kawan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, stageState, justFiredCommand: justFired }),
      });
      const data = await res.json();
      const reply = data.reply || (justFired ? 'Done!' : "Hmm, no answer.");
      setMessages(m => [...m, { role: 'kawan', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'kawan', text: justFired ? 'Done! Command sent.' : "Can't reach the server right now." }]);
    }
    setThinking(false);
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const suggestions = [
    "Turn on Device 1",
    "Turn off everything",
    "What's wasting energy?",
    "Status of the room?",
  ];

  return (
    <div className="judge-kawan">
      <div className="judge-kawan-left">
        <div className="judge-kawan-stage" ref={stageRef}>
          <div className={`kawan-aura-judge ${mood}`}/>
        </div>
        <div className="judge-kawan-name">⚡ KAWAN</div>
        <div className="judge-kawan-mood-label">{
          mood === 'alert'           ? '⚠️ Alert — waste detected' :
          mood === 'class-starting'  ? '🚪 Entry detected' :
          mood === 'responding'      ? '💭 Thinking...' :
                                       '🟢 Watching the stage'
        }</div>
      </div>

      <div className="judge-kawan-right">
        <div className="judge-kawan-strip" ref={stripRef}>
          {messages.map((m, i) => (
            <div key={i} className={`judge-kawan-msg ${m.role}`}>{m.text}</div>
          ))}
          {thinking && (
            <div className="judge-kawan-msg kawan thinking">
              <span className="dot"/><span className="dot"/><span className="dot"/>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="judge-kawan-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="judge-kawan-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask Kawan, or say 'turn on Device 1'..."
          />
          <button className="judge-kawan-send" onClick={send} disabled={thinking}>SEND →</button>
        </div>
      </div>
    </div>
  );
}

window.JudgeKawan = JudgeKawan;
window.parseDeviceIntent = parseDeviceIntent;
