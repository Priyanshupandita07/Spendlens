import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { AuditFormData, AuditSummary, LeadData, ToolAuditResult } from '@/types'
import { useAISummary } from '@/hooks/useAISummary'

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const TYPE_COLORS: Record<string, string> = {
  downgrade_plan: '#f59e0b', switch_tool: '#3b82f6', right_sized: '#8b5cf6',
  overpaying_retail: '#ef4444', already_optimal: '#00e5a0', consider_credits: '#f97316',
}
const TYPE_LABELS: Record<string, string> = {
  downgrade_plan: 'DOWNGRADE', switch_tool: 'SWITCH TOOL', right_sized: 'VERIFY',
  overpaying_retail: 'OVERPAYING', already_optimal: 'OPTIMAL', consider_credits: 'GET CREDITS',
}

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const isOptimal = result.potentialMonthlySavings === 0
  const color = TYPE_COLORS[result.recommendationType] ?? 'var(--accent)'
  const label = TYPE_LABELS[result.recommendationType] ?? 'REVIEW'

  return (
    <div className="responsive-card" style={{
      borderRadius: '12px', padding: '20px',
      border: `1px solid ${isOptimal ? 'var(--border)' : color + '35'}`,
      background: 'var(--bg-card)', marginBottom: '10px',
    }}>
      <div className="tool-result-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              {result.toolLabel}
            </span>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
              fontFamily: 'DM Mono, monospace', fontWeight: 700,
              background: color + '18', color,
            }}>{label}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {result.currentPlan} · {result.seats} seat{result.seats > 1 ? 's' : ''} · ${fmt(result.currentMonthlySpend)}/mo
          </div>
        </div>
        {!isOptimal && (
          <div className="tool-result-savings" style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
              −${fmt(result.potentialMonthlySavings)}/mo
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ${fmt(result.potentialAnnualSavings)}/yr
            </div>
          </div>
        )}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: isOptimal ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '8px' }}>
        {result.recommendedAction}
      </div>
      <div style={{
        fontSize: '12px', lineHeight: 1.6, padding: '10px 12px',
        borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-secondary)',
      }}>
        {result.reasoningNote}
      </div>
      {result.credexOpportunity && (
        <div style={{
          marginTop: '10px', fontSize: '12px', padding: '8px 12px',
          borderRadius: '8px', background: 'var(--accent-dim)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>💡</span> Credex can source discounted credits for this — see below.
        </div>
      )}
    </div>
  )
}

function LeadCaptureForm({ auditId, monthlySavings, isHighSavings }: {
  auditId: string; monthlySavings: number; isHighSavings: boolean
}) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot || !email) return
    setLoading(true)
    const lead: LeadData = { auditId, email, companyName: company || undefined, role: role || undefined, totalMonthlySavings: monthlySavings }
    await fetch('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, honeypot }),
    }).catch(() => {})
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) return (
    <div style={{ borderRadius: '12px', border: '1px solid var(--accent)', background: 'var(--accent-dim)', padding: '24px', textAlign: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Report sent to {email}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isHighSavings ? "A Credex advisor will reach out within 1 business day." : "We'll notify you when new optimizations apply."}
      </div>
    </div>
  )

  return (
    <div style={{ borderRadius: '12px', border: `1px solid ${isHighSavings ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--bg-card)', padding: '24px' }}>
      {isHighSavings && (
        <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', background: 'var(--accent)', color: '#000', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px' }}>
          HIGH SAVINGS DETECTED
        </div>
      )}
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '16px' }}>
        {isHighSavings ? 'Get your report + talk to Credex' : 'Stay updated on your stack'}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        {isHighSavings
          ? `You have $${fmt(monthlySavings)}/mo ($${fmt(monthlySavings * 12)}/yr) in savings opportunities. Credex sources discounted AI credits — let's find you a better deal.`
          : "Your stack looks healthy. We'll ping you when new savings opportunities open up for your tools."}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Work email *</label>
          <input type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg)', border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--border-hover)')} />
        </div>
        <div className="lead-form-grid">
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Company</label>
            <input type="text" placeholder="Acme Inc." value={company} onChange={e => setCompany(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Your role</label>
            <input type="text" placeholder="CTO, Eng Manager…" value={role} onChange={e => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
        </div>
        <button type="submit" disabled={loading || !email}
          style={{
            padding: '12px', borderRadius: '10px', fontFamily: 'Syne, sans-serif',
            fontWeight: 700, fontSize: '14px', border: 'none',
            cursor: loading || !email ? 'not-allowed' : 'pointer', opacity: loading || !email ? 0.5 : 1,
            background: isHighSavings ? 'var(--accent)' : 'var(--bg)',
            color: isHighSavings ? '#000' : 'var(--text-primary)',
            ...(isHighSavings ? {} : { border: '1px solid var(--border-hover)' }),
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (isHighSavings && !loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { if (isHighSavings) e.currentTarget.style.background = 'var(--accent)' }}
        >
          {loading ? 'Saving…' : isHighSavings ? 'Get report + book Credex call →' : 'Notify me →'}
        </button>
      </form>
      <p style={{ fontSize: '11px', marginTop: '10px', color: 'var(--text-muted)' }}>
        No spam. Unsubscribe anytime. Email captured after value shown — never before.
      </p>
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<AuditFormData | null>(null)
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { summary: aiSummary, loading: aiLoading, isFallback } = useAISummary(summary, formData)

  useEffect(() => {
    if (!id) return
    const cached = sessionStorage.getItem(`audit_${id}`)
    if (cached) {
      const parsed = JSON.parse(cached) as { formData: AuditFormData; summary: AuditSummary }
      setFormData(parsed.formData)
      setSummary(parsed.summary)
      setLoading(false)
      return
    }
    fetch('/api/audit/' + id).then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setFormData(data.audit_data as AuditFormData)
        setSummary(data.audit_summary as AuditSummary)
      }
      setLoading(false)
    })
  }, [id])

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '16px', animation: 'pulse 1.5s ease infinite' }}>◈</div>
        <p style={{ color: 'var(--text-secondary)' }}>Running your audit…</p>
      </div>
    </div>
  )

  if (!summary || !id) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Audit not found.</p>
        <button onClick={() => navigate('/audit')} style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--accent)', color: '#000', fontFamily: 'Syne, sans-serif', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Run a new audit →
        </button>
      </div>
    </div>
  )

  const isHighSavings = summary.totalPotentialMonthlySavings >= 500
  const isOptimal = summary.savingsCategory === 'optimal'
  const sortedResults = [...summary.toolResults].sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.3,
      }} />

      <div className="page-container">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <button onClick={() => navigate('/audit')} style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            ← Edit inputs
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)' }}>Results</span>
        </div>

        {/* Hero savings card */}
        <div className="results-hero" style={{
          border: `1px solid ${isOptimal ? 'var(--border)' : 'var(--accent)'}`,
          background: isOptimal ? 'var(--bg-card)' : 'var(--accent-dim)',
        }}>
          {!isOptimal && (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
          )}
          {isOptimal ? (
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent)', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.35rem, 5vw, 1.75rem)', color: 'var(--text-primary)', marginBottom: '8px' }}>You're spending well</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Your AI stack of <strong style={{ color: 'var(--text-primary)' }}>${fmt(summary.totalCurrentMonthlySpend)}/mo</strong> is well-optimised. No obvious waste found.
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.08em' }}>POTENTIAL SAVINGS IDENTIFIED</div>
              <div className="results-savings-amount">
                ${fmt(summary.totalPotentialMonthlySavings)}
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>per month</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: 'var(--text-primary)', marginBottom: '16px' }}>
                ${fmt(summary.totalPotentialAnnualSavings)} annually
              </div>
              <div style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)', display: 'inline-block' }}>
                out of ${fmt(summary.totalCurrentMonthlySpend)}/mo current spend
              </div>
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="results-share-grid">
          {[
            { label: copied ? '✓ Link copied!' : '📋 Share this audit', action: copyShareLink, active: copied },
            { label: '↩ Edit inputs', action: () => navigate('/audit'), active: false },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
              border: `1px solid ${btn.active ? 'var(--accent)' : 'var(--border-hover)'}`,
              background: btn.active ? 'var(--accent-dim)' : 'var(--bg-card)',
              color: btn.active ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{btn.label}</button>
          ))}
        </div>

        {/* Credex CTA */}
        {isHighSavings && (
          <div style={{ borderRadius: '12px', border: '1px solid var(--accent)', background: 'var(--bg-card)', padding: '20px', marginBottom: '20px' }}>
            <div className="credex-cta-row">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#000', fontSize: '18px', flexShrink: 0 }}>$</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Credex can capture even more of this</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                  Credex sources discounted AI infrastructure credits — Cursor, Claude, ChatGPT and others — from companies that overforecast. Same tools, real discount.
                </p>
                <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', color: '#000', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  Book a Credex consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {(aiSummary || aiLoading) && (
          <div style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', letterSpacing: '0.08em' }}>AI SUMMARY</span>
              {isFallback && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>(templated)</span>}
            </div>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Generating summary…</span>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{aiSummary}</p>
            )}
          </div>
        )}

        {/* Tool breakdown */}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Tool breakdown
          <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>sorted by savings opportunity</span>
        </h2>
        {sortedResults.map(result => <ToolResultCard key={result.toolId} result={result} />)}

        {/* Lead capture */}
        <div style={{ marginTop: '24px' }}>
          <LeadCaptureForm auditId={id} monthlySavings={summary.totalPotentialMonthlySavings} isHighSavings={isHighSavings} />
        </div>

        <p style={{ fontSize: '11px', textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
          Audit generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Pricing verified May 2025 ·{' '}
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>credex.rocks</a>
        </p>
      </div>
    </div>
  )
}
