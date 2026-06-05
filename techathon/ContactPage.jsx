// ContactPage.jsx — Contact form for the BiJAk team (UM aesthetic)
// Posts to Netlify Forms. A hidden form with matching `name="bijak-contact-um"`
// is declared in index.html so Netlify's build bot detects it.

const CONTACT_EMAIL = 'terminatorsbijak.inquiries@gmail.com';

function ContactPage() {
  const [form, setForm] = React.useState({ name: '', email: '', institution: '', subject: 'General Inquiry', message: '' });
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in name, email, and message.');
      return;
    }
    setError('');
    try {
      const body = new URLSearchParams({ 'form-name': 'bijak-contact-um', ...form }).toString();
      await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    } catch { /* show thank-you anyway */ }
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 14 }}>📬</div>
        <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 36, color: 'var(--gold)', letterSpacing: '0.04em', textShadow: 'var(--gold-glow)', marginBottom: 10 }}>
          THANKS!
        </div>
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7 }}>
          We'll get back to you within <b style={{ color: 'var(--gold)' }}>48 hours</b> 😊
        </div>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', institution: '', subject: 'General Inquiry', message: '' }); }} style={{
          marginTop: 28, background: 'var(--gold)', color: '#0A1628', border: 'none',
          borderRadius: 12, padding: '12px 28px',
          fontFamily: 'Archivo Black', fontSize: 14, letterSpacing: '0.04em',
          cursor: 'pointer', boxShadow: '0 0 20px rgba(255,199,44,0.5)',
        }}>Send another →</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <KLSkylineSVG style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        width: '100%', opacity: 0.05, fill: 'var(--text-primary)', pointerEvents: 'none',
      }}/>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <HibiscusAccent size={20}/>
          <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 42, color: 'var(--gold)', letterSpacing: '0.06em', textShadow: 'var(--gold-glow)' }}>
            CONTACT
          </div>
          <HibiscusAccent size={20} style={{ transform: 'scaleX(-1)' }}/>
        </div>
        <div style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Got a question, partnership, or bug? Drop us a line.
        </div>
        <div className="malaysia-accent" style={{ maxWidth: 400, margin: '14px auto 0' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22, alignItems: 'start' }} className="contact-grid">
        {/* Form */}
        <form onSubmit={submit} name="bijak-contact-um" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" className="batik-bg" style={{
          background: 'var(--card-bg)', border: '1.5px solid rgba(255,199,44,0.3)',
          borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
        }}>
          {/* Batik strip top accent */}
          <div className="batik-strip" style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.7 }}></div>

          <input type="hidden" name="form-name" value="bijak-contact-um"/>
          <p style={{ display: 'none' }}><label>Don't fill: <input name="bot-field" onChange={() => {}}/></label></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
            <UM_Field label="Name" required>
              <input value={form.name} onChange={upd('name')} name="name" type="text" required style={umInputStyle}/>
            </UM_Field>
            <UM_Field label="Email" required>
              <input value={form.email} onChange={upd('email')} name="email" type="email" required style={umInputStyle}/>
            </UM_Field>
            <UM_Field label="Institution / Organisation">
              <input value={form.institution} onChange={upd('institution')} name="institution" type="text" style={umInputStyle}/>
            </UM_Field>
            <UM_Field label="Subject">
              <select value={form.subject} onChange={upd('subject')} name="subject" style={umInputStyle}>
                <option>General Inquiry</option>
                <option>Technical Issue</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </UM_Field>
            <UM_Field label="Message" required>
              <textarea value={form.message} onChange={upd('message')} name="message" rows={5} required style={{ ...umInputStyle, resize: 'vertical', minHeight: 110, fontFamily: 'Poppins, sans-serif' }}/>
            </UM_Field>

            {error && (
              <div style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--red-alert)', padding: '8px 12px', background: 'rgba(255,59,59,0.08)', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" style={{
              background: 'var(--gold)', color: '#0A1628', border: 'none',
              borderRadius: 12, padding: '13px 28px',
              fontFamily: 'Archivo Black, sans-serif', fontSize: 15,
              cursor: 'pointer', letterSpacing: '0.05em',
              boxShadow: '0 0 24px rgba(255,199,44,0.5), 0 6px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(255,199,44,0.7), 0 10px 20px rgba(0,0,0,0.35)'; }}
            onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.boxShadow = '0 0 24px rgba(255,199,44,0.5), 0 6px 16px rgba(0,0,0,0.3)'; }}>
              Send Message →
            </button>
          </div>
        </form>

        {/* Info column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <UM_InfoCard icon="📧" title="Email us directly">
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gold)', textDecoration: 'none', wordBreak: 'break-all', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
              {CONTACT_EMAIL}
            </a>
          </UM_InfoCard>
          <UM_InfoCard icon="🎓" title="The Project">
            BiJAk is a student project by Team Terminators for UM Technothon 2026. We built it because energy waste in classrooms is real, persistent, and largely invisible.
          </UM_InfoCard>
          <UM_InfoCard icon="🏫" title="Want BiJAk at your school?">
            Pick subject = <b style={{ color: 'var(--gold)' }}>Partnership</b> in the form and we'll share the recipe — hardware list, install guide, deploy steps.
          </UM_InfoCard>
          <UM_InfoCard icon="🐛" title="Reporting a bug?">
            Pick <b style={{ color: 'var(--gold)' }}>Technical Issue</b> and include the browser, URL, and any red errors from the DevTools Console.
          </UM_InfoCard>
        </div>
      </div>
    </div>
  );
}

const umInputStyle = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 13px',
  fontFamily: 'Poppins, sans-serif', fontSize: 16,
  color: 'var(--text-primary)', outline: 'none',
  transition: 'border-color 0.2s',
};

function UM_Field({ label, required, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: 'var(--gold)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function UM_InfoCard({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 13, color: 'var(--gold)', letterSpacing: '0.03em' }}>{title}</div>
      </div>
      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}
