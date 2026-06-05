// JudgeGate.jsx — Password gate for the Technothon judge route.
// Maroon + gold + stage spotlight aesthetic.
// Posts to /.netlify/functions/judge-gate. Password lives only in Netlify env.

function useJudgeTypewriter(text, speed = 28) {
  const [out, setOut] = React.useState('');
  React.useEffect(() => {
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

const KAWAN_JUDGE_INTRO = "Hey judge. Ready to see something real? Password, please 👀";
const KAWAN_JUDGE_WRONG = [
  "Hmm... that's not it. Sure you're on the list? 👀",
  "Nope. Try again.",
  "That's not the password I'd accept from a judge.",
  "Close enough? Not really. Try once more.",
];

function judgeIsLocalDev() {
  if (typeof window === 'undefined') return false;
  const proto = window.location.protocol;
  const host  = window.location.hostname;
  return proto === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '';
}

function JudgeGate({ onPass }) {
  const [pwd,   setPwd]   = React.useState('');
  const [busy,  setBusy]  = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [msg,   setMsg]   = React.useState(KAWAN_JUDGE_INTRO);
  const speech = useJudgeTypewriter(msg, 26);
  const localDev = judgeIsLocalDev();

  const submit = async () => {
    if (!pwd.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/.netlify/functions/judge-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        // Persist across tabs so the popup-on-UM-site → new judge tab flow
        // doesn't re-prompt for the password.
        localStorage.setItem('judge_pass',    data.token || '1');
        localStorage.setItem('judge_pass_ts', String(Date.now()));
        onPass();
      } else {
        setShake(true);
        setMsg(KAWAN_JUDGE_WRONG[Math.floor(Math.random() * KAWAN_JUDGE_WRONG.length)]);
        setPwd('');
        setTimeout(() => setShake(false), 500);
        setBusy(false);
      }
    } catch {
      setShake(true);
      setMsg("Can't reach the server. Try once more.");
      setTimeout(() => setShake(false), 500);
      setBusy(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="judge-shell">
      {/* Stage spotlights */}
      <div className="judge-spotlight judge-spotlight-l"></div>
      <div className="judge-spotlight judge-spotlight-r"></div>

      {/* Dust motes */}
      <div className="judge-dust-layer">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="judge-dust" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${-Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 15}s`,
            width: 2 + Math.random() * 3 + 'px',
            height: 2 + Math.random() * 3 + 'px',
          }}/>
        ))}
      </div>

      <div className={`judge-gate-card ${shake ? 'gate-shake' : ''}`}>
        <div className="judge-curtain-top"></div>

        <div className="judge-gate-title">BiJAk · LIVE</div>
        <div className="judge-gate-sub">UM Technothon 2026 — Judges Only</div>

        <div className="judge-gate-info">
          <b>Technothon Judges</b> — welcome to the live BiJAk demo.<br/>
          Here's your chance to experience BiJAk beyond the slides. This site is connected to <b>real hardware on stage</b>.<br/>
          <span style={{ opacity: 0.7 }}>Access is restricted to judges and the BiJAk team.</span>
        </div>

        <div className="judge-gate-dialogue">
          <div className="judge-speaker-tag">⚡ KAWAN</div>
          <div className="judge-speech">{speech}<span style={{ opacity: 0.55 }}>|</span></div>

          <div className="judge-input-row">
            <input
              className="judge-input"
              type="password"
              placeholder="Enter password..."
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              disabled={busy}
            />
            <button className="judge-submit" onClick={submit} disabled={busy}>
              {busy ? '...' : 'ENTER'}
            </button>
          </div>
        </div>

        <div className="judge-footer-text">
          BiJAk is a student project developed for UM Technothon 2026 by Team Terminators.<br/>
          Built for demonstration purposes only.
        </div>

        {localDev && (
          <div className="judge-devmode">
            💻 Local preview detected — judge-gate function not reachable here.{' '}
            <span onClick={() => { localStorage.setItem('judge_pass', 'dev'); localStorage.setItem('judge_pass_ts', String(Date.now())); onPass(); }}>
              Skip gate (dev mode)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
