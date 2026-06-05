// FAQPage.jsx — Frequently Asked Questions (UM aesthetic: navy + gold + batik)

const UM_FAQ_ITEMS = [
  {
    q: "What is BiJAk?",
    a: "BiJAk (Building Intelligence Joint Automation Kit) is an AI-powered smart classroom management system built for Universiti Malaya. It monitors every room in real time, detects energy waste, automates appliance control, and gives live cost + carbon impact data."
  },
  {
    q: "What does 'BiJAk' mean?",
    a: "Bijak means \"intelligent\" or \"wise\" in Malay. It's also an acronym — Building Intelligence Joint Automation Kit."
  },
  {
    q: "Who is Kawan?",
    a: "Kawan means \"friend\" in Malay. He's the AI brain inside BiJAk — powered by Groq's llama-3.3-70b model. He watches every classroom 24/7, answers questions in casual Malaysian English, and proactively flags waste."
  },
  {
    q: "How does BiJAk detect occupancy?",
    a: "Three layered data sources: (1) Tuya WiFi door sensors track who enters/exits, (2) PIR motion sensors detect active movement, (3) mmWave human presence sensors catch people who are sitting still. Combining all three eliminates false negatives."
  },
  {
    q: "What hardware does BiJAk use?",
    a: "Standard Tuya-compatible smart home hardware: door sensors, motion sensors, human presence sensors, IR blasters (for AC + projectors), fingerbots (to press physical switches), smart plugs, and smart switches. Total cost per classroom: around RM150 for the base kit."
  },
  {
    q: "How are the energy / CO₂ / RM numbers calculated?",
    a: "Real math, real published constants. Energy: kWh = device wattage × hours running ÷ 1000. CO₂: kWh × 0.694 (Malaysia grid emission factor, source: Suruhanjaya Tenaga). Cost: kWh × 0.218 (TNB domestic tariff). Run-times come from real Tuya device state-change timestamps — no estimates, no invented numbers."
  },
  {
    q: "How do I add a new classroom to my BiJAk dashboard?",
    a: "Go to Dashboard → Manage Classrooms → Add Classroom. Give it a name and assign the Tuya device IDs for any sensors/devices in that room. Devices you don't have can stay toggled off — they'll be hidden from that room's controls."
  },
  {
    q: "What data does BiJAk collect about students?",
    a: "None about students personally. BiJAk only collects anonymous occupancy events (door open/close timestamps, motion detected/clear, headcount estimates) and device state changes. No names, no faces, no identifying info."
  },
  {
    q: "Is BiJAk secure?",
    a: "Yes. All Tuya and Groq API keys live exclusively in Netlify Function environment variables — never in the frontend, never in the source code. The site is HTTPS, and the judge site is password-protected. Device commands go through Netlify Functions only, so nobody can hit your hardware directly from the browser."
  },
  {
    q: "How do I reset a Tuya device?",
    a: "Hold the device's reset button for 5 seconds until the LED blinks fast. Then re-pair it through the Smart Life app. Full step-by-step is in our Troubleshooting page."
  },
  {
    q: "Can I run BiJAk in my own school or building?",
    a: "Yes — the whole system is designed to be replicable. Same hardware, same Netlify Functions, same calc engine works anywhere. Reach out through the Contact page for the recipe and deploy guide."
  },
  {
    q: "Where can I see BiJAk running on real hardware?",
    a: "Try the live version from the popup on this site, or ask a team member for the password. There's a real Stage classroom wired up for the Technothon judges."
  },
];

function UM_FAQItem({ item, open, onToggle }) {
  return (
    <div className="batik-bg" style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 14, marginBottom: 10, overflow: 'hidden',
      boxShadow: open ? '0 4px 16px rgba(0,0,0,0.25), var(--gold-glow)' : '0 1px 4px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.25s, border-color 0.25s',
      borderColor: open ? 'rgba(255,199,44,0.4)' : 'var(--border)',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', textAlign: 'left',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: 'Archivo Black, sans-serif', fontSize: 14,
        color: 'var(--text-primary)', letterSpacing: '0.02em',
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--gold)', color: '#0A1628',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Archivo Black', fontSize: 14,
          flexShrink: 0, transition: 'transform 0.25s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          boxShadow: '0 0 8px rgba(255,199,44,0.5)',
        }}>+</span>
        <span style={{ flex: 1 }}>{item.q}</span>
      </button>
      {open && (
        <div style={{
          padding: '0 18px 16px 56px',
          fontFamily: 'Poppins, sans-serif', fontSize: 13,
          color: 'var(--text-secondary)', lineHeight: 1.75,
          animation: 'fadeSlideIn 0.3s ease',
        }}>
          {item.a}
        </div>
      )}
    </div>
  );
}

function FAQPage() {
  const [openIdx, setOpenIdx] = React.useState(0);
  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* KL skyline at the bottom */}
      <KLSkylineSVG style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        width: '100%', opacity: 0.05, fill: 'var(--text-primary)', pointerEvents: 'none',
      }}/>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <HibiscusAccent size={20}/>
          <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 42, color: 'var(--gold)', letterSpacing: '0.06em', textShadow: 'var(--gold-glow)' }}>
            FAQ
          </div>
          <HibiscusAccent size={20} style={{ transform: 'scaleX(-1)' }}/>
        </div>
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Frequently asked questions about BiJAk
        </div>
        <div className="malaysia-accent" style={{ maxWidth: 400, margin: '14px auto 0' }}></div>
      </div>

      {UM_FAQ_ITEMS.map((item, i) => (
        <UM_FAQItem key={i} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
      ))}

      <div style={{ marginTop: 28, padding: 18, background: 'rgba(255,199,44,0.07)', border: '1px solid rgba(255,199,44,0.25)', borderRadius: 14, textAlign: 'center', fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65 }}>
        Can't find your question? Ask <b style={{ color: 'var(--gold)' }}>Kawan</b> directly in the chat — he might know.
      </div>
    </div>
  );
}
