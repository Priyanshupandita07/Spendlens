import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { AuditFormData, AuditSummary, LeadData, ToolAuditResult } from '@/types'
import { saveLead, getAudit } from '@/lib/supabase'

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function SavingsBadge({ savings }: { savings: number }) {
  if (savings === 0)
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-mono"
        style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
      >
        optimal
      </span>
    )
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
    >
      save ${fmt(savings)}/mo
    </span>
  )
}

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const isOptimal = result.potentialMonthlySavings === 0
  return (
    <div
      className="rounded-xl border p-5 transition-all"
      style={{
        borderColor: isOptimal ? 'var(--border)' : 'rgba(0,229,160,0.25)',
        background: 'var(--bg-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div
            className="font-bold text-sm mb-0.5"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            {result.toolLabel}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {result.currentPlan} · {result.seats} seat
            {result.seats > 1 ? 's' : ''} · ${fmt(result.currentMonthlySpend)}
            /mo
          </div>
        </div>
        <SavingsBadge savings={result.potentialMonthlySavings} />
      </div>

      <div
        className="text-sm font-semibold mb-1"
        style={{ color: isOptimal ? 'var(--text-secondary)' : 'var(--accent)' }}
      >
        {result.recommendedAction}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {result.reasoningNote}
      </div>

      {result.credexOpportunity && (
        <div
          className="mt-3 text-xs px-3 py-2 rounded-lg"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          💡 Credex can source discounted credits for this — book a call below.
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
  // Honeypot field — bots fill this, humans don't see it
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return // bot detected
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
        <div className="text-2xl mb-2">✓</div>
        <div
          className="font-bold mb-1"
          style={{
            fontFamily: 'Syne, sans-serif',
            color: 'var(--text-primary)',
          }}
        >
          Report saved to {email}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isHighSavings
            ? "We'll be in touch about how Credex can help you capture these savings."
            : "We'll notify you when new optimizations apply to your stack."}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border p-6"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      <h3
        className="font-bold mb-1"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
      >
        {isHighSavings
          ? 'Get your full report + talk to Credex'
          : 'Get notified when new optimizations apply'}
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
        {isHighSavings
          ? `You have $${fmt(monthlySavings)}/mo in savings opportunities. Credex sources discounted AI credits — let's talk.`
          : 'Your stack looks healthy. Enter your email to get notified when things change.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — visually hidden */}
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
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{
            background: isHighSavings ? 'var(--accent)' : 'var(--bg)',
            color: isHighSavings ? '#000' : 'var(--text-primary)',
            border: isHighSavings ? 'none' : '1px solid var(--border-hover)',
            fontFamily: 'Syne, sans-serif',
          }}
        >
          {loading
            ? 'Saving…'
            : isHighSavings
              ? 'Get report + book Credex call →'
              : 'Notify me →'}
        </button>
      </form>
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<AuditFormData | null>(null)
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Try sessionStorage first (just ran the audit)
    const cached = sessionStorage.getItem(`audit_${id}`)
    if (cached) {
      const parsed = JSON.parse(cached) as {
        formData: AuditFormData
        summary: AuditSummary
      }
      setFormData(parsed.formData)
      setSummary(parsed.summary)
      setLoading(false)
      return
    }

    // Fallback: load from Supabase (shared link)
    getAudit(id).then((data) => {
      if (data) {
        setFormData(data.audit_data as AuditFormData)
        setSummary(data.audit_summary as AuditSummary)
      }
      setLoading(false)
    })
  }, [id])

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="text-4xl mb-4 animate-pulse"
            style={{ color: 'var(--accent)' }}
          >
            ◈
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading audit…</p>
        </div>
      </div>
    )
  }

  if (!summary || !formData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <p
            className="mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Audit not found.
          </p>
          <button
            onClick={() => navigate('/audit')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Run a new audit →
          </button>
        </div>
      </div>
    )
  }

  const isHighSavings = summary.totalPotentialMonthlySavings >= 500
  const isOptimal = summary.savingsCategory === 'optimal'

  return (
    <div
      className="min-h-screen pt-20 pb-24"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Back */}
        <button
          onClick={() => navigate('/audit')}
          className="flex items-center gap-1 text-sm mb-8 pt-6 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = 'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = 'var(--text-muted)')
          }
        >
          ← Edit audit
        </button>

        {/* Hero savings */}
        <div
          className="rounded-2xl border p-8 mb-6 text-center"
          style={{
            borderColor: isOptimal ? 'var(--border)' : 'var(--accent)',
            background: isOptimal ? 'var(--bg-card)' : 'var(--accent-dim)',
          }}
        >
          {isOptimal ? (
            <>
              <div className="text-4xl mb-3">✓</div>
              <h1
                className="text-2xl font-extrabold mb-2"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                You're spending well
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your current AI stack of ${fmt(summary.totalCurrentMonthlySpend)}
                /mo is well-optimised. No obvious waste found.
              </p>
            </>
          ) : (
            <>
              <div
                className="text-xs font-mono mb-3"
                style={{ color: 'var(--accent)' }}
              >
                POTENTIAL SAVINGS FOUND
              </div>
              <div
                className="text-6xl font-extrabold mb-1"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  color: 'var(--accent)',
                }}
              >
                ${fmt(summary.totalPotentialMonthlySavings)}
                <span className="text-2xl">/mo</span>
              </div>
              <div
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                ${fmt(summary.totalPotentialAnnualSavings)} annually
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Out of your current ${fmt(summary.totalCurrentMonthlySpend)}/mo
                AI spend
              </p>
            </>
          )}
        </div>

        {/* Share */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={copyShareLink}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
            style={{
              borderColor: 'var(--border-hover)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            📋 Copy share link
          </button>
          <button
            onClick={() => navigate('/audit')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
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
            style={{
              borderColor: 'var(--accent)',
              background: 'var(--accent-dim)',
            }}
          >
            <div
              className="font-bold mb-1"
              style={{
                fontFamily: 'Syne, sans-serif',
                color: 'var(--accent)',
              }}
            >
              Credex can capture more of this
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Credex sources discounted AI infrastructure credits — Cursor,
              Claude, ChatGPT and others — from companies that overforecast.
              Real discounts on the exact tools you're paying retail for.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: 'var(--accent)',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              Book a Credex consultation →
            </a>
          </div>
        )}

        {/* Per-tool results */}
        <h2
          className="text-lg font-bold mb-4"
          style={{
            fontFamily: 'Syne, sans-serif',
            color: 'var(--text-primary)',
          }}
        >
          Tool breakdown
        </h2>
        <div className="space-y-3 mb-8">
          {summary.toolResults.map((result) => (
            <ToolResultCard key={result.toolId} result={result} />
          ))}
        </div>

        {/* Lead capture */}
        <LeadCaptureForm
          auditId={id!}
          monthlySavings={summary.totalPotentialMonthlySavings}
          isHighSavings={isHighSavings}
        />

        {/* Footer note */}
        <p
          className="text-xs text-center mt-6"
          style={{ color: 'var(--text-muted)' }}
        >
          Audit generated {new Date().toLocaleDateString()} · Pricing data
          verified May 2025 ·{' '}
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            credex.rocks
          </a>
        </p>
      </div>
    </div>
  )
}
