import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { runAudit } from '@/lib/auditEngine'
import { saveAudit } from '@/lib/supabase'
import { nanoid } from 'nanoid'
import type { AuditFormData, ToolEntry, ToolId, UseCase } from '@/types'
import { TOOL_LABELS, TOOL_ICONS, TOOL_PLANS, USE_CASE_LABELS } from '@/types'
import { getPlanPrice } from '@/lib/pricing'

const ALL_TOOLS: ToolId[] = [
  'cursor', 'github_copilot', 'claude', 'chatgpt',
  'anthropic_api', 'openai_api', 'gemini', 'windsurf',
]

const TOOL_COLORS: Record<ToolId, string> = {
  cursor: '#7c5cfc', github_copilot: '#3b82f6', claude: '#d97706',
  chatgpt: '#10b981', anthropic_api: '#f59e0b', openai_api: '#6366f1',
  gemini: '#ec4899', windsurf: '#06b6d4',
}

const TOOL_DESCRIPTIONS: Record<ToolId, string> = {
  cursor: 'AI-native code editor', github_copilot: 'IDE code completion',
  claude: 'Reasoning & writing', chatgpt: 'General AI assistant',
  anthropic_api: 'Direct API access', openai_api: 'Direct API access',
  gemini: "Google's AI assistant", windsurf: 'AI-native code editor',
}

const DEFAULT_FORM: AuditFormData = {
  tools: ALL_TOOLS.map((toolId) => ({
    toolId, plan: TOOL_PLANS[toolId][0].id,
    monthlySpend: 0, seats: 1, enabled: false,
  })),
  teamSize: 1, useCase: 'coding',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

interface ToolCardProps {
  tool: ToolEntry
  onToggle: () => void
  onUpdate: (updates: Partial<ToolEntry>) => void
}

function ToolCard({ tool, onToggle, onUpdate }: ToolCardProps) {
  const plans = TOOL_PLANS[tool.toolId]
  const color = TOOL_COLORS[tool.toolId]
  const isAPI = tool.toolId === 'anthropic_api' || tool.toolId === 'openai_api'

  function handlePlanChange(planId: string) {
    const price = getPlanPrice(tool.toolId, planId)
    onUpdate({ plan: planId, monthlySpend: price > 0 ? price * tool.seats : tool.monthlySpend })
  }

  function handleSeatsChange(seats: number) {
    const price = getPlanPrice(tool.toolId, tool.plan)
    onUpdate({ seats, monthlySpend: price > 0 ? price * seats : tool.monthlySpend })
  }

  return (
    <div style={{
      borderRadius: '12px',
      border: `1px solid ${tool.enabled ? color + '50' : 'var(--border)'}`,
      background: tool.enabled ? color + '08' : 'var(--bg-card)',
      transition: 'all 0.2s',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
      >
        {/* Checkbox */}
        <div style={{
          width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
          border: `2px solid ${tool.enabled ? color : 'var(--border-hover)'}`,
          background: tool.enabled ? color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {tool.enabled && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Icon */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: color + '20', color, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700,
        }}>
          {TOOL_ICONS[tool.toolId]}
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px',
            color: tool.enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}>
            {TOOL_LABELS[tool.toolId]}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {TOOL_DESCRIPTIONS[tool.toolId]}
          </div>
        </div>

        {/* Right side */}
        {tool.enabled && tool.monthlySpend > 0 ? (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 600, color, flexShrink: 0 }}>
            ${fmt(tool.monthlySpend)}/mo
          </div>
        ) : (
          !tool.enabled && (
            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)', flexShrink: 0 }}>
              not using
            </div>
          )
        )}
      </div>

      {/* Expanded inputs */}
      {tool.enabled && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${color}20`,
          paddingTop: '14px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isAPI ? '1fr 1fr' : '1fr 80px 100px', gap: '10px' }}>
            {/* Plan */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Plan
              </label>
              <select
                value={tool.plan}
                onChange={e => handlePlanChange(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  fontSize: '12px', outline: 'none', cursor: 'pointer',
                  background: 'var(--bg)', border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
              >
                {plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            {/* Seats */}
            {!isAPI && (
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Seats
                </label>
                <input
                  type="number" min={1} max={10000}
                  value={tool.seats}
                  onChange={e => handleSeatsChange(Math.max(1, parseInt(e.target.value) || 1))}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '8px',
                    fontSize: '12px', outline: 'none',
                    background: 'var(--bg)', border: '1px solid var(--border-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            {/* Monthly spend */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                {isAPI ? 'Monthly bill ($)' : 'Monthly ($)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number" min={0} step={1}
                  value={tool.monthlySpend || ''}
                  onChange={e => onUpdate({ monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })}
                  onClick={e => e.stopPropagation()}
                  placeholder="0"
                  style={{
                    width: '100%', paddingLeft: '22px', paddingRight: '8px',
                    paddingTop: '8px', paddingBottom: '8px',
                    borderRadius: '8px', fontSize: '12px', outline: 'none',
                    background: 'var(--bg)', border: '1px solid var(--border-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Warnings */}
          {tool.toolId === 'claude' && tool.plan === 'team' && tool.seats < 5 && (
            <div style={{ marginTop: '8px', fontSize: '11px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,77,77,0.08)', color: '#ff4d4d' }}>
              ⚠ Claude Team requires minimum 5 seats
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AuditPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useLocalStorage<AuditFormData>('spendlens_form', DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalSpend, setTotalSpend] = useState(0)

  const enabledTools = formData.tools.filter(t => t.enabled)
  const enabledCount = enabledTools.length

  useEffect(() => {
    setTotalSpend(enabledTools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0))
  }, [formData])

  function updateTool(toolId: ToolId, updates: Partial<ToolEntry>) {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(t => t.toolId === toolId ? { ...t, ...updates } : t),
    }))
  }

  function toggleTool(toolId: ToolId) {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(t => {
        if (t.toolId !== toolId) return t
        const enabling = !t.enabled
        if (enabling && t.monthlySpend === 0) {
          const price = getPlanPrice(toolId, t.plan)
          return { ...t, enabled: true, monthlySpend: price > 0 ? price * t.seats : 0 }
        }
        return { ...t, enabled: enabling }
      }),
    }))
  }

  async function handleSubmit() {
    if (enabledCount === 0) { setError('Please enable at least one AI tool.'); return }
    setError('')
    setLoading(true)
    try {
      const summary = runAudit(formData)
      const id = nanoid(10)
      await saveAudit(formData, summary, id).catch(() => {})
      sessionStorage.setItem(`audit_${id}`, JSON.stringify({ formData, summary }))
      navigate(`/results/${id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.3,
      }} />

      <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <a href="/" style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >← Home</a>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/</span>
            <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)' }}>Audit</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Your AI stack
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Toggle every tool you pay for. We'll find where you're overspending.
          </p>
        </div>

        {/* Live spend counter */}
        {totalSpend > 0 && (
          <div style={{
            borderRadius: '12px', border: '1px solid var(--accent)',
            background: 'var(--accent-dim)', padding: '16px 20px',
            marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', marginBottom: '4px', letterSpacing: '0.08em' }}>
                CURRENT MONTHLY SPEND
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                ${fmt(totalSpend)}<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>${fmt(totalSpend * 12)}/year</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{enabledCount} tool{enabledCount !== 1 ? 's' : ''} tracked</div>
            </div>
          </div>
        )}

        {/* Team context */}
        <div style={{
          borderRadius: '12px', border: '1px solid var(--border)',
          background: 'var(--bg-card)', padding: '20px', marginBottom: '20px',
        }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Team context
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Team size (people)
              </label>
              <input
                type="number" min={1} max={100000}
                value={formData.teamSize}
                onChange={e => setFormData(prev => ({ ...prev, teamSize: Math.max(1, parseInt(e.target.value) || 1) }))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  fontSize: '13px', outline: 'none',
                  background: 'var(--bg)', border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-hover)')}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Primary use case
              </label>
              <select
                value={formData.useCase}
                onChange={e => setFormData(prev => ({ ...prev, useCase: e.target.value as UseCase }))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', cursor: 'pointer',
                  background: 'var(--bg)', border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-hover)')}
              >
                {(Object.keys(USE_CASE_LABELS) as UseCase[]).map(uc => (
                  <option key={uc} value={uc}>{USE_CASE_LABELS[uc]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tool cards */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            AI tools{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— toggle every one you pay for</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.tools.map(tool => (
              <ToolCard
                key={tool.toolId}
                tool={tool}
                onToggle={() => toggleTool(tool.toolId)}
                onUpdate={updates => updateTool(tool.toolId, updates)}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ fontSize: '13px', color: 'var(--red)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || enabledCount === 0}
            style={{
              flex: 1, padding: '14px', borderRadius: '10px',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px',
              border: 'none', cursor: enabledCount > 0 ? 'pointer' : 'not-allowed',
              background: enabledCount > 0 ? 'var(--accent)' : 'var(--bg-card)',
              color: enabledCount > 0 ? '#000' : 'var(--text-muted)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (enabledCount > 0) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (enabledCount > 0) e.currentTarget.style.background = 'var(--accent)' }}
          >
            {loading
              ? 'Analysing…'
              : enabledCount === 0
                ? 'Toggle at least one tool to continue'
                : `Run audit — ${enabledCount} tool${enabledCount > 1 ? 's' : ''} · $${fmt(totalSpend)}/mo →`}
          </button>
          <button
            onClick={() => { if (confirm('Reset all form data?')) setFormData(DEFAULT_FORM) }}
            title="Reset"
            style={{
              padding: '14px 16px', borderRadius: '10px', fontSize: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >↺</button>
        </div>

        <p style={{ fontSize: '11px', textAlign: 'center', marginTop: '12px', color: 'var(--text-muted)' }}>
          Your inputs are saved automatically — come back anytime and they'll still be here.
        </p>
      </div>
    </div>
  )
}
