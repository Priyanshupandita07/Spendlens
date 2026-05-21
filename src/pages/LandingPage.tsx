import { useNavigate } from 'react-router-dom'

const tools = [
  { name: 'Cursor', icon: '⌥', color: '#7c5cfc' },
  { name: 'Claude', icon: '◈', color: '#d97706' },
  { name: 'ChatGPT', icon: '◉', color: '#10b981' },
  { name: 'Copilot', icon: '◎', color: '#3b82f6' },
  { name: 'Gemini', icon: '◆', color: '#f59e0b' },
  { name: 'Windsurf', icon: '◀', color: '#06b6d4' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }}
      />

      {/* Top glow */}
      <div
        className="fixed top-0 left-1/2 pointer-events-none"
        style={{
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(0,229,160,0.08) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative mx-auto px-6 pt-32 pb-24"
        style={{ maxWidth: '960px' }}
      >
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
          className="animate-fade-up stagger-1">
          <span
            className="text-xs px-3 py-1 rounded-full border font-mono"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              background: 'var(--accent-dim)',
              letterSpacing: '0.05em',
            }}
          >
            FREE · NO LOGIN REQUIRED · TAKES 2 MINUTES
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up stagger-2"
          style={{
            fontFamily: 'Syne, sans-serif',
            color: 'var(--text-primary)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Are you{' '}
          <span style={{ color: 'var(--accent)' }} className="text-glow">
            overpaying
          </span>
          <br />
          for AI tools?
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up stagger-3"
          style={{
            textAlign: 'center',
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          The free AI spend auditor for startups. Input your stack, get an
          instant breakdown of where you're overspending — and exactly how much
          you can save.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-up stagger-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '3rem',
          }}
        >
          <button
            onClick={() => navigate('/audit')}
            className="animate-pulse-glow"
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Audit my AI spend →
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No credit card. No email required upfront.
          </p>
        </div>

        {/* Tool chips */}
        <div
          className="animate-fade-up stagger-5"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '5rem',
          }}
        >
          {tools.map((t) => (
            <span
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-hover)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-card)',
              }}
            >
              <span style={{ color: t.color }}>{t.icon}</span>
              {t.name}
            </span>
          ))}
          <span
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
            }}
          >
            + more
          </span>
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{ marginBottom: '5rem' }}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            How it works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Enter your stack',
                desc: 'Tell us which AI tools you pay for, what plan, and how many seats.',
              },
              {
                step: '02',
                title: 'Get your audit',
                desc: "Instant, rule-based analysis — where you're overspending, what to switch, total savings.",
              },
              {
                step: '03',
                title: 'Share or act',
                desc: 'Share a unique link with your team. Book a call if you want help acting on it.',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--accent)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div
          style={{
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { num: '$2,400', label: 'avg. annual savings found' },
              { num: '< 2 min', label: 'to complete an audit' },
              { num: '8 tools', label: 'audited in the engine' },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    color: 'var(--accent)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '0.25rem',
                  }}
                >
                  {s.num}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/audit')}
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start your free audit →
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Built by{' '}
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              Credex
            </a>{' '}
            · AI infrastructure credits at a discount
          </p>
        </div>
      </div>
    </div>
  )
}
