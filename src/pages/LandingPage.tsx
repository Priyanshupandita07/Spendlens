import { useNavigate } from 'react-router-dom'

const tools = [
  { name: 'Cursor', icon: '⌥', color: '#7c5cfc' },
  { name: 'Claude', icon: '◈', color: '#d97706' },
  { name: 'ChatGPT', icon: '◉', color: '#10b981' },
  { name: 'Copilot', icon: '◎', color: '#3b82f6' },
  { name: 'Gemini', icon: '◆', color: '#f59e0b' },
  { name: 'Windsurf', icon: '◀', color: '#06b6d4' },
]

const steps = [
  { step: '01', title: 'Enter your stack', desc: 'Select which AI tools you pay for, what plan, and how many seats.' },
  { step: '02', title: 'Get your audit', desc: "Instant rule-based analysis — where you're overspending, what to switch, total savings." },
  { step: '03', title: 'Share or act', desc: 'Share a unique link with your team. Book a call if you want help acting on it.' },
]

const stats = [
  { num: '$2,400', label: 'avg. annual savings found' },
  { num: '< 2 min', label: 'to complete an audit' },
  { num: '8 tools', label: 'audited in the engine' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.35,
      }} />

      {/* Top glow */}
      <div className="landing-glow" />

      <div className="landing-container">

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <span style={{
            fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
            border: '1px solid var(--accent)', color: 'var(--accent)',
            background: 'var(--accent-dim)', letterSpacing: '0.08em', fontFamily: 'DM Mono, monospace',
          }}>
            FREE · NO LOGIN · 2 MINUTES
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          lineHeight: 1.05, letterSpacing: '-0.02em',
          textAlign: 'center', color: 'var(--text-primary)',
          marginBottom: '20px',
        }}>
          Are you <span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(0,229,160,0.4)' }}>overpaying</span>
          <br />for AI tools?
        </h1>

        {/* Subheadline */}
        <p style={{
          textAlign: 'center', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', lineHeight: 1.65,
          color: 'var(--text-secondary)', maxWidth: '500px',
          margin: '0 auto 36px', padding: '0 8px',
        }}>
          The free AI spend auditor for startups. Input your stack, get an instant
          breakdown of where you're overspending — and exactly how much you can save.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <button
            onClick={() => navigate('/audit')}
            style={{
              background: 'var(--accent)', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', padding: '14px 32px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(0,229,160,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Audit my AI spend →
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            No credit card. No email required upfront.
          </span>
        </div>

        {/* Tool chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '80px' }}>
          {tools.map(t => (
            <span key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', padding: '6px 14px', borderRadius: '999px',
              border: '1px solid var(--border-hover)', color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
            }}>
              <span style={{ color: t.color }}>{t.icon}</span>{t.name}
            </span>
          ))}
          <span style={{
            fontSize: '13px', padding: '6px 14px', borderRadius: '999px',
            border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)',
          }}>+ more</span>
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1.5rem', color: 'var(--text-primary)',
            textAlign: 'center', marginBottom: '40px',
          }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {steps.map(s => (
              <div key={s.step} style={{
                padding: '24px', borderRadius: '12px',
                border: '1px solid var(--border)', background: 'var(--bg-card)',
              }}>
                <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', marginBottom: '12px' }}>{s.step}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="landing-stats-card">
          <div className="landing-stats-inner">
            {stats.map(s => (
              <div key={s.label}>
                <div className="landing-stat-num" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '4px' }}>{s.num}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ preview */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1.5rem', color: 'var(--text-primary)',
            textAlign: 'center', marginBottom: '32px',
          }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'Is this actually free?', a: 'Yes, completely. No credit card, no trial. The audit is free because SpendLens is built by Credex — we only make money if you buy discounted credits through us.' },
              { q: 'How accurate is the pricing data?', a: 'Every price is sourced from official vendor pricing pages with URLs and dates logged in our public PRICING_DATA.md. We update it weekly.' },
              { q: 'Do you store my data?', a: 'Form inputs are saved in your browser only. If you enter your email for the report, that is stored securely. Shareable URLs strip all PII — only tools and savings numbers are shown.' },
            ].map(faq => (
              <div key={faq.q} className="responsive-card" style={{
                padding: '20px 24px', borderRadius: '12px',
                border: '1px solid var(--border)', background: 'var(--bg-card)',
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px' }}>{faq.q}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/audit')}
            style={{
              background: 'var(--accent)', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', padding: '14px 32px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Start your free audit →
          </button>
          <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Built by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Credex</a> · AI infrastructure credits at a discount
          </p>
        </div>
      </div>
    </div>
  )
}
