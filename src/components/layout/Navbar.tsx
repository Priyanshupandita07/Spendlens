import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontWeight: 800, fontSize: '14px', fontFamily: 'DM Mono, monospace' }}>$</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
            SpendLens
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/#how-it-works" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            How it works
          </a>
          <button
            onClick={() => navigate('/audit')}
            style={{
              fontSize: '13px', padding: '6px 16px', borderRadius: '999px',
              border: '1px solid var(--accent)', color: 'var(--accent)',
              background: 'transparent', cursor: 'pointer', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#000' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}
          >
            Start audit →
          </button>
        </div>
      </div>
    </nav>
  )
}
