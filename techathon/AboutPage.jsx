// AboutPage.jsx — BIJAK & KAWAN intro / explainer page

function AboutPage({ onEnter }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--body-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '40px 24px 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Real batik texture — top-right corner accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 320, height: 320,
        backgroundImage: 'url("uploads/Gemini_Generated_Image_r8eckxr8eckxr8ec-0e7da652.png")',
        backgroundSize: 'cover',
        borderRadius: '0 0 0 100%',
        opacity: 0.12,
        pointerEvents: 'none',
        maskImage: 'radial-gradient(circle at top right, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(circle at top right, black 30%, transparent 75%)',
      }} />

      {/* Real batik texture — bottom-left corner accent */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0,
        width: 280, height: 280,
        backgroundImage: 'url("uploads/Gemini_Generated_Image_r8eckxr8eckxr8ec-0e7da652.png")',
        backgroundSize: 'cover',
        borderRadius: '0 100% 0 0',
        opacity: 0.08,
        pointerEvents: 'none',
        maskImage: 'radial-gradient(circle at bottom left, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(circle at bottom left, black 30%, transparent 75%)',
      }} />

      {/* Hibiscus — top left */}
      <img src="uploads/hibiscus-clipart-xl-6a3365f9.png" alt="" style={{
        position: 'absolute', top: 40, left: -20,
        width: 160, height: 160,
        opacity: 0.13,
        filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.1)',
        pointerEvents: 'none',
        transform: 'rotate(-20deg)',
      }} />

      {/* KL Skyline watermark */}
      <KLSkylineSVG style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        width: '100%', opacity: 0.06,
        fill: 'var(--text-primary)', pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,199,44,0.1)', border: '1px solid rgba(255,199,44,0.3)',
          borderRadius: 20, padding: '5px 16px', marginBottom: 20,
          fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase'
        }}>
          <HibiscusAccent style={{ width: 16, height: 16 }} />
          UM Technothon 2026 · Smart Energy Management
          <HibiscusAccent style={{ width: 16, height: 16 }} />
        </div>

        {/* BIJAK logo large */}
        <div style={{
          fontFamily: 'Archivo Black, sans-serif',
          fontSize: 'clamp(56px, 10vw, 96px)',
          color: 'var(--gold)',
          textShadow: '0 0 40px rgba(255,199,44,0.5), 0 0 80px rgba(255,199,44,0.2)',
          letterSpacing: '0.12em',
          lineHeight: 1,
          marginBottom: 8,
        }}>BIJAK</div>

        <div style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 16, color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          marginBottom: 6,
        }}>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Bijak</span> — <em>Intelligent / Wise</em> in Malay
        </div>

        {/* BIJAK acronym */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,199,44,0.08)',
          border: '1px solid rgba(255,199,44,0.25)',
          borderRadius: 10, padding: '8px 20px',
          fontSize: 13, color: 'var(--text-secondary)',
          marginBottom: 20, letterSpacing: '0.02em',
        }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>B</span>uilding{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>I</span>ntelligence{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>J</span>oint{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>A</span>utomation{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>K</span>it
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold))', borderRadius: 2 }}></div>
          <HibiscusAccent size={24} />
          <div style={{ width: 80, height: 2, background: 'linear-gradient(270deg, transparent, var(--gold))', borderRadius: 2 }}></div>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24, maxWidth: 1100, width: '100%',
        position: 'relative', zIndex: 1, marginBottom: 40,
      }}>

        {/* BIJAK card */}
        <div className="panel-card batik-bg" style={{ borderColor: 'rgba(255,199,44,0.25)' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <HibiscusAccent size={20} />
              <div>
                <div style={{ fontFamily: 'Archivo Black', fontSize: 20, color: 'var(--gold)' }}>BIJAK</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>The Smart Classroom System</div>
              </div>
            </div>
            <div className="batik-strip" style={{ marginBottom: 16 }}></div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.75, marginBottom: 16 }}>
              <strong style={{ color: 'var(--gold)' }}>Bijak</strong> means <em>"intelligent"</em> or <em>"wise"</em> in Malay — and that's exactly what this system is.
              BIJAK is an AI-powered classroom management platform built for <strong>Universiti Malaya</strong>, designed to eliminate energy waste across campus.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
              Think Google Home meets NASA mission control — but for university classrooms. BIJAK monitors every room in real time, detects waste patterns, automates appliance control, and gives you live cost + carbon impact data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📡', label: 'Occupancy Detection', desc: 'Real-time sensor data — knows who\'s in the room' },
                { icon: '🌡️', label: 'Auto AC Control', desc: 'Adjusts temperature based on occupancy & schedule' },
                { icon: '📽️', label: 'Idle Projector Shutoff', desc: 'Kills idle projectors after 15 min — no signal = off' },
                { icon: '👻', label: 'Ghost Booking Detection', desc: 'Room reserved but nobody showed? Shut it all down' },
                { icon: '⚡', label: 'Live Energy Dashboard', desc: 'kWh, RM saved, and CO₂ prevented — all live' },
              ].map(item => (
                <div key={item.icon} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--feed-bg)',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KAWAN card */}
        <div className="panel-card batik-bg" style={{ borderColor: 'rgba(26,63,143,0.4)' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {/* KAWAN IMAGE GOES HERE */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                overflow: 'hidden', border: '2px solid var(--gold)',
                background: 'white', flexShrink: 0,
                boxShadow: '0 0 16px rgba(255,199,44,0.4)',
              }}>
                <img src="uploads/preview (1).png" alt="KAWAN"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 5%' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Archivo Black', fontSize: 20, color: 'var(--gold)' }}>KAWAN</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>The AI Brain Inside BIJAK</div>
              </div>
            </div>
            <div className="batik-strip" style={{ marginBottom: 16 }}></div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.75, marginBottom: 10 }}>
              <strong style={{ color: 'var(--gold)' }}>Kawan</strong> means <em>"friend"</em> in Malay. He's also an acronym:
            </p>

            {/* Acronym breakdown — corrected */}
            <div style={{
              background: 'rgba(26,63,143,0.2)',
              border: '1px solid rgba(26,63,143,0.4)',
              borderRadius: 10, padding: '14px 16px', marginBottom: 16,
              fontFamily: 'Poppins',
            }}>
              {[
                { letter: 'K', word: 'Knowledge-Aware', desc: "Knows every room's schedule, sensors, and history" },
                { letter: 'A', word: 'Automation',      desc: 'Acts without being asked — always one step ahead' },
                { letter: 'W', word: 'Workspace',       desc: 'Built specifically for educational environments' },
                { letter: 'A', word: 'Analytics',       desc: 'Tracks energy, efficiency and waste in real time' },
                { letter: 'N', word: 'Network',         desc: 'Connected to every device across all classrooms' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'baseline',
                  padding: '6px 0',
                  borderBottom: i < 4 ? '1px solid rgba(255,199,44,0.08)' : 'none'
                }}>
                  <span style={{ fontFamily: 'Archivo Black', fontSize: 22, color: 'var(--gold)', minWidth: 22 }}>{item.letter}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, minWidth: 110 }}>{item.word}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>— {item.desc}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 16 }}>
              KAWAN is your campus AI — witty, sassy, always-on. Never boring, never corporate, and never lets energy go to waste.
            </p>

            {/* Personality quotes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '"AC\'s been running at 18°C with 3 people in the room. Bumping to 24°C — that\'s RM12 saved today alone 😏"',
                '"Ghost booking detected lah — room was reserved but nobody showed. Shutting everything down."',
                '"Done — projector\'s on, AC\'s running. You\'re welcome 💅"',
              ].map((q, i) => (
                <div key={i} style={{
                  fontSize: 12, color: 'var(--text-primary)',
                  fontStyle: 'italic', lineHeight: 1.6,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(255,199,44,0.07)',
                  borderLeft: '3px solid var(--gold)',
                }}>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Problem card */}
        <div className="panel-card batik-bg" style={{ borderColor: 'rgba(255,59,59,0.2)' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,59,59,0.1)',
                border: '1px solid rgba(255,59,59,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>⚡</div>
              <div>
                <div style={{ fontFamily: 'Archivo Black', fontSize: 18, color: 'var(--text-primary)' }}>The Problem</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Energy waste in Malaysian universities</div>
              </div>
            </div>
            <div className="batik-strip" style={{ marginBottom: 16 }}></div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 16 }}>
              Malaysian educational buildings waste millions in electricity every year. The culprits are always the same:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '📽️', text: 'Projectors left ON with no signal for hours' },
                { icon: '❄️', text: 'AC blasting at 18°C in empty rooms' },
                { icon: '💡', text: 'Lights at full brightness when daylight is sufficient' },
                { icon: '👻', text: 'Ghost bookings — rooms reserved, never used' },
                { icon: '🌙', text: 'Equipment running past 10PM with zero activity' },
                { icon: '🔌', text: 'Phantom loads on standby 24/7 after class ends' },
              ].map(item => (
                <div key={item.icon} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  fontSize: 12, color: 'var(--text-primary)',
                  padding: '8px 10px', borderRadius: 7,
                  background: 'rgba(255,59,59,0.06)',
                  border: '1px solid rgba(255,59,59,0.12)',
                }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: 'rgba(255,199,44,0.08)',
              border: '1px solid rgba(255,199,44,0.25)',
              borderRadius: 10, fontSize: 13,
              color: 'var(--text-primary)', lineHeight: 1.6,
            }}>
              💛 BIJAK solves <strong>all of these</strong> — automatically, intelligently, and in real time. That's the mission.
            </div>
          </div>
        </div>

        {/* Impact card */}
        <div className="panel-card batik-bg" style={{ borderColor: 'rgba(46,204,113,0.2)' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(46,204,113,0.1)',
                border: '1px solid rgba(46,204,113,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>🌿</div>
              <div>
                <div style={{ fontFamily: 'Archivo Black', fontSize: 18, color: 'var(--text-primary)' }}>The Impact</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Smart Energy Management for a Sustainable Future</div>
              </div>
            </div>
            <div className="batik-strip" style={{ marginBottom: 16 }}></div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            {[
              { val: '32.4 kWh', label: 'Saved per day (demo estimate)', icon: '⚡' },
              { val: 'RM 148+', label: 'Recovered daily across UM classrooms', icon: '💰' },
              { val: '16.2 kg', label: 'CO₂ prevented per day', icon: '🌱' },
              { val: '94%', label: 'Reduction in ghost booking waste', icon: '👻' },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Archivo Black', fontSize: 22, color: 'var(--gold)' }}>{stat.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Universiti Malaya has <strong style={{ color: 'var(--text-primary)' }}>hundreds of classrooms</strong>. Scale BIJAK across all of them and you're looking at <strong style={{ color: 'var(--gold)' }}>thousands of ringgit saved monthly</strong> and measurable carbon reduction every semester.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <button
          onClick={onEnter}
          style={{
            background: 'var(--gold)',
            color: '#0A1628',
            border: 'none',
            borderRadius: 12,
            padding: '16px 48px',
            fontFamily: 'Archivo Black, sans-serif',
            fontSize: 18,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            boxShadow: '0 0 32px rgba(255,199,44,0.5), 0 8px 24px rgba(0,0,0,0.3)',
            transition: 'all 0.25s',
            marginBottom: 12,
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(255,199,44,0.7), 0 12px 32px rgba(0,0,0,0.4)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(255,199,44,0.5), 0 8px 24px rgba(0,0,0,0.3)'; }}
        >
          Enter BIJAK Dashboard →
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          Interactive demo · Guided tutorial included
        </div>
      </div>

      {/* KL Skyline label at bottom */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.12em',
        textTransform: 'uppercase', opacity: 0.4, whiteSpace: 'nowrap',
      }}>
        Kuala Lumpur · Universiti Malaya · Malaysia
      </div>
    </div>
  );
}
