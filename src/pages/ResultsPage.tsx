import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { AuditFormData, AuditSummary, LeadData, ToolAuditResult } from '@/types'
import { saveLead, getAudit } from '@/lib/supabase'

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const TYPE_COLORS: Record<string, string> = {
  downgrade_plan: '#f59e0b',
  switch_tool: '#3b82f6',
  right_sized: '#8b5cf6',
  overpaying_retail: '#ef4444',
  already_optimal: '#00e5a0',
  consider_credits: '#f97316',
}

const TYPE_LABELS: Record<string, string> = {
  downgrade_plan: 'DOWNGRADE',
  switch_tool: 'SWITCH TOOL',
  right_sized: 'VERIFY',
  overpaying_retail: 'OVERPAYING',
  already_optimal: 'OPTIMAL',
  consider_credits: 'GET CREDITS',
}

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const isOptimal = result.potentialMonthlySavings === 0
  const color = TYPE_COLORS[result.recommendationType] ?? 'var(--accent)'
  const label = TYPE_LABELS[result.recommendationType] ?? 'REVIEW'

  return (
    <div
      className="rounded-xl border p-5 transition-all"
      style={{
        borderColor: isOptimal ? 'var(--border)' : color + '40',
        background: 'var(--bg-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-bold text-sm"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
            >
              {result.toolLabel}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-bold"
              style={{ background: color + '15', color }}
            >
              {label}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {result.currentPlan} · {result.seats} seat{result.seats > 1 ? 's' : ''} · ${fmt(result.currentMonthlySpend)}/mo
          </div>
        </div>
        {!isOptimal && (
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold mono" style={{ color: 'var(--accent)' }}>
              −${fmt(result.potentialMonthlySavings)}/mo
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ${fmt(result.potentialAnnualSavings)}/yr
            </div>
          </div>
        )}
      </div>

      {/* Recommended action */}
      <div
        className="text-sm font-semibold mb-2"
        style={{ color: isOptimal ? 'var(--text-secondary)' : 'var(--text-primary)' }}
      >
        {result.recommendedAction}
      </div>

      {/* Reasoning */}
      <div
        className="text-xs leading-relaxed p-3 rounded-lg"
        style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}
      >
        {result.reasoningNote}
      </div>

      {/* Credex opportunity */}
      {result.credexOpportunity && (
        <div
          className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          <span>💡</span>
          <span>Credex can source discounted credits for this — see below.</span>
        </div>
      )}
    </div>
  )
}

function LeadCaptureForm({
  auditId,
  monthlySavings,
  isHighSavings,
}: {
  auditId: string
  monthlySavings: number
  isHighSavings: boolean
}) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (!email) return
    setLoading(true)

    const lead: LeadData = {
      auditId,
      email,
      companyName: company || undefined,
      role: role || undefined,
      totalMonthlySavings: monthlySavings,
    }

    await saveLead(lead).catch(() => {})
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl border p-6 text-center"
        style={{ borderColor: 'var(--accent)', background: 'var(--accent-dim)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'var(--accent)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div
          className="font-bold mb-1"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
        >
          Report sent to {email}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isHighSavings
            ? "A Credex advisor will reach out within 1 business day to help you act on these savings."
            : "We'll notify you when new optimizations apply to your stack."}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border p-6"
      style={{ borderColor: isHighSavings ? 'var(--accent)' : 'var(--border)', background: 'var(--bg-card)' }}
    >
      {isHighSavings && (
        <div
          className="text-xs font-mono mb-3 px-2 py-1 rounded inline-block"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          HIGH SAVINGS DETECTED
        </div>
      )}
      <h3
        className="font-bold mb-1"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
      >
        {isHighSavings
          ? 'Get your report + talk to Credex'
          : 'Stay updated on your stack'}
      </h3>
      <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
        {isHighSavings
          ? `You have $${fmt(monthlySavings)}/mo ($${fmt(monthlySavings * 12)}/yr) in savings opportunities. Credex sources discounted AI credits — let's find you a better deal.`
          : "Your stack looks healthy. We'll ping you when new savings opportunities open up for your tools."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
            Work email *
          </label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
              Company
            </label>
            <input
              type="text"
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
              Your role
            </label>
            <input
              type="text"
              placeholder="CTO, Eng Manager…"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isHighSavings ? 'var(--accent)' : 'var(--bg)',
            color: isHighSavings ? '#000' : 'var(--text-primary)',
            border: isHighSavings ? 'none' : '1px solid var(--border-hover)',
            fontFamily: 'Syne, sans-serif',
          }}
          onMouseEnter={(e) => {
            if (isHighSavings && !loading) e.currentTarget.style.background = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            if (isHighSavings) e.currentTarget.style.background = 'var(--accent)'
          }}
        >
          {loading ? 'Saving…' : isHighSavings ? 'Get report + book Credex call →' : 'Notify me →'}
        </button>
      </form>

      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        No spam. Unsubscribe anytime. Email captured after value shown — never before.
      </p>
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    const cached = sessionStorage.getItem(`audit_${id}`)
    if (cached) {
      const parsed = JSON.parse(cached) as { formData: AuditFormData; summary: AuditSummary }
      setSummary(parsed.summary)
      setLoading(false)
      return
    }
    getAudit(id).then((data) => {
      if (data) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse" style={{ color: 'var(--accent)' }}>◈</div>
          <p style={{ color: 'var(--text-secondary)' }}>Running your audit…</p>
        </div>
      </div>
    )
  }

  if (!summary || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Audit not found.</p>
          <button
            onClick={() => navigate('/audit')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--accent)', color: '#000', fontFamily: 'Syne, sans-serif' }}
          >
            Run a new audit →
          </button>
        </div>
      </div>
    )
  }

  const isHighSavings = summary.totalPotentialMonthlySavings >= 500
  const isOptimal = summary.savingsCategory === 'optimal'
  const sortedResults = [...summary.toolResults].sort(
    (a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings
  )

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: 'var(--bg)' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 pt-6">
          <button
            onClick={() => navigate('/audit')}
            className="text-xs font-mono transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ← Edit inputs
          </button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>Results</span>
        </div>

        {/* Hero savings card */}
        <div
          className="rounded-2xl border p-8 mb-5 text-center relative overflow-hidden"
          style={{
            borderColor: isOptimal ? 'var(--border)' : 'var(--accent)',
            background: isOptimal ? 'var(--bg-card)' : 'var(--accent-dim)',
          }}
        >
          {/* Glow */}
          {!isOptimal && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.1) 0%, transparent 60%)',
              }}
            />
          )}

          {isOptimal ? (
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1
                className="text-2xl font-extrabold mb-2"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
              >
                You're spending well
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your AI stack of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${fmt(summary.totalCurrentMonthlySpend)}/mo</span> is well-optimised. No obvious waste found.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="text-xs font-mono mb-3" style={{ color: 'var(--accent)' }}>
                POTENTIAL SAVINGS IDENTIFIED
              </div>
              <div
                className="text-7xl font-extrabold mb-1 text-glow"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}
              >
                ${fmt(summary.totalPotentialMonthlySavings)}
              </div>
              <div className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
                per month
              </div>
              <div
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
              >
                ${fmt(summary.totalPotentialAnnualSavings)} annually
              </div>
              <div
                className="inline-block text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}
              >
                out of ${fmt(summary.totalCurrentMonthlySpend)}/mo current spend
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={copyShareLink}
            className="py-3 rounded-xl text-sm font-medium border transition-all"
            style={{
              borderColor: copied ? 'var(--accent)' : 'var(--border-hover)',
              background: copied ? 'var(--accent-dim)' : 'var(--bg-card)',
              color: copied ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {copied ? '✓ Link copied!' : '📋 Share this audit'}
          </button>
          <button
            onClick={() => navigate('/audit')}
            className="py-3 rounded-xl text-sm font-medium border transition-all"
            style={{
              borderColor: 'var(--border-hover)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            ↩ Edit inputs
          </button>
        </div>

        {/* Credex CTA — high savings only */}
        {isHighSavings && (
          <div
            className="rounded-xl border p-5 mb-6"
            style={{ borderColor: 'var(--accent)', background: 'var(--bg-card)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black"
                style={{ background: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}
              >
                $
              </div>
              <div className="flex-1">
                <div
                  className="font-bold mb-1"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
                >
                  Credex can capture even more of this
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Credex sources discounted AI infrastructure credits — Cursor, Claude, ChatGPT and others — from companies that overforecast. The same tools you use today, at a real discount.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: 'var(--accent)',
                    color: '#000',
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  Book a Credex consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Per-tool breakdown */}
        <h2
          className="text-base font-bold mb-4"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
        >
          Tool breakdown
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            sorted by savings opportunity
          </span>
        </h2>

        <div className="space-y-3 mb-8">
          {sortedResults.map((result) => (
            <ToolResultCard key={result.toolId} result={result} />
          ))}
        </div>

        {/* Lead capture */}
        <LeadCaptureForm
          auditId={id}
          monthlySavings={summary.totalPotentialMonthlySavings}
          isHighSavings={isHighSavings}
        />

        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Audit generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ·
          Pricing verified May 2025 ·{' '}
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            credex.rocks
          </a>
        </p>
      </div>
    </div>
  )
}
