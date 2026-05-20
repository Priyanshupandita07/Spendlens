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

      {/* Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,229,160,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-up stagger-1">
          <span
            className="text-xs px-3 py-1 rounded-full border font-mono"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              background: 'var(--accent-dim)',
            }}
          >
            FREE · NO LOGIN REQUIRED · TAKES 2 MINUTES
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-center text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 animate-fade-up stagger-2"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
        >
          Are you{' '}
          <span style={{ color: 'var(--accent)' }} className="text-glow">
            overpaying
          </span>
          <br />
          for AI tools?
        </h1>

        {/* Sub */}
        <p
          className="text-center text-lg sm:text-xl max-w-xl mx-auto mb-10 animate-fade-up stagger-3"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
        >
          The free AI spend auditor for startups. Input your stack, get an
          instant breakdown of where you're overspending — and exactly how much
          you can save.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up stagger-4">
          <button
            onClick={() => navigate('/audit')}
            className="group px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 animate-pulse-glow"
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No credit card. No email required upfront.
          </p>
        </div>

        {/* Tool chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-20 animate-fade-up stagger-5">
          {tools.map((t) => (
            <span
              key={t.name}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border"
              style={{
                borderColor: 'var(--border-hover)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-card)',
              }}
            >
              <span style={{ color: t.color }}>{t.icon}</span>
              {t.name}
            </span>
          ))}
          <span
            className="text-sm px-3 py-1.5 rounded-full border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
            }}
          >
            + more
          </span>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mb-24">
          <h2
            className="text-center text-2xl font-bold mb-12"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                className="p-6 rounded-xl border"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-card)',
                }}
              >
                <div
                  className="text-xs font-mono mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.step}
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div
          className="rounded-xl border p-8 text-center mb-16"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { num: '$2,400', label: 'avg. annual savings found' },
              { num: '< 2 min', label: 'to complete an audit' },
              { num: '8 tools', label: 'audited in the engine' },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="text-3xl font-extrabold mb-1"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}
                >
                  {s.num}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/audit')}
            className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-200"
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
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
          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
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
