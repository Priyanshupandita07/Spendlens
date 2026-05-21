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
  'cursor',
  'github_copilot',
  'claude',
  'chatgpt',
  'anthropic_api',
  'openai_api',
  'gemini',
  'windsurf',
]

const TOOL_COLORS: Record<ToolId, string> = {
  cursor: '#7c5cfc',
  github_copilot: '#3b82f6',
  claude: '#d97706',
  chatgpt: '#10b981',
  anthropic_api: '#f59e0b',
  openai_api: '#6366f1',
  gemini: '#ec4899',
  windsurf: '#06b6d4',
}

const TOOL_DESCRIPTIONS: Record<ToolId, string> = {
  cursor: 'AI-native code editor',
  github_copilot: 'IDE code completion',
  claude: 'Reasoning & writing',
  chatgpt: 'General AI assistant',
  anthropic_api: 'Direct API access',
  openai_api: 'Direct API access',
  gemini: "Google's AI assistant",
  windsurf: 'AI-native code editor',
}

const DEFAULT_FORM: AuditFormData = {
  tools: ALL_TOOLS.map((toolId) => ({
    toolId,
    plan: TOOL_PLANS[toolId][0].id,
    monthlySpend: 0,
    seats: 1,
    enabled: false,
  })),
  teamSize: 1,
  useCase: 'coding',
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

  // Auto-calculate spend when plan or seats change
  function handlePlanChange(planId: string) {
    const price = getPlanPrice(tool.toolId, planId)
    const autoSpend = price > 0 ? price * tool.seats : tool.monthlySpend
    onUpdate({ plan: planId, monthlySpend: autoSpend })
  }

  function handleSeatsChange(seats: number) {
    const price = getPlanPrice(tool.toolId, tool.plan)
    const autoSpend = price > 0 ? price * seats : tool.monthlySpend
    onUpdate({ seats, monthlySpend: autoSpend })
  }

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        borderColor: tool.enabled ? color + '60' : 'var(--border)',
        background: tool.enabled ? color + '08' : 'var(--bg-card)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        {/* Checkbox */}
        <div
          className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: tool.enabled ? color : 'var(--border-hover)',
            background: tool.enabled ? color : 'transparent',
          }}
        >
          {tool.enabled && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: color + '20', color }}
        >
          {TOOL_ICONS[tool.toolId]}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: tool.enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {TOOL_LABELS[tool.toolId]}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {TOOL_DESCRIPTIONS[tool.toolId]}
          </div>
        </div>

        {/* Monthly spend preview */}
        {tool.enabled && tool.monthlySpend > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold mono" style={{ color }}>
              ${fmt(tool.monthlySpend)}/mo
            </div>
          </div>
        )}

        {!tool.enabled && (
          <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            not using
          </span>
        )}
      </div>

      {/* Expanded inputs */}
      {tool.enabled && (
        <div
          className="px-4 pb-4 pt-1 border-t"
          style={{ borderColor: color + '20' }}
        >
          <div className="grid grid-cols-3 gap-3 mt-3">
            {/* Plan */}
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
                Plan
              </label>
              <select
                value={tool.plan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg text-xs outline-none transition-all"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = color)}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Seats — hide for API tools */}
            {!isAPI ? (
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Seats
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={tool.seats}
                  onChange={(e) => handleSeatsChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-hover)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = color)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
                />
              </div>
            ) : (
              <div />
            )}

            {/* Monthly spend */}
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isAPI ? 'Monthly bill ($)' : 'Monthly spend ($)'}
              </label>
              <div className="relative">
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={tool.monthlySpend || ''}
                  onChange={(e) => onUpdate({ monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full pl-6 pr-2 py-2 rounded-lg text-xs outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-hover)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = color)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
                  placeholder="0"
                />
              </div>
              {isAPI && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Check your last invoice
                </p>
              )}
            </div>
          </div>

          {/* Plan note for min seats */}
          {tool.toolId === 'claude' && tool.plan === 'team' && tool.seats < 5 && (
            <div
              className="mt-2 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,77,77,0.08)', color: '#ff4d4d' }}
            >
              ⚠ Claude Team requires a minimum of 5 seats
            </div>
          )}
          {tool.toolId === 'chatgpt' && tool.plan === 'team' && tool.seats < 2 && (
            <div
              className="mt-2 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,77,77,0.08)', color: '#ff4d4d' }}
            >
              ⚠ ChatGPT Team requires a minimum of 2 seats
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

  const enabledTools = formData.tools.filter((t) => t.enabled)
  const enabledCount = enabledTools.length

  // Live total spend counter
  useEffect(() => {
    const total = enabledTools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0)
    setTotalSpend(total)
  }, [formData])

  function updateTool(toolId: ToolId, updates: Partial<ToolEntry>) {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => (t.toolId === toolId ? { ...t, ...updates } : t)),
    }))
  }

  function toggleTool(toolId: ToolId) {
    const tool = formData.tools.find((t) => t.toolId === toolId)
    if (!tool) return
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => {
        if (t.toolId !== toolId) return t
        const enabling = !t.enabled
        // Auto-set spend from plan price when enabling
        if (enabling && t.monthlySpend === 0) {
          const price = getPlanPrice(toolId, t.plan)
          return { ...t, enabled: true, monthlySpend: price > 0 ? price * t.seats : 0 }
        }
        return { ...t, enabled: enabling }
      }),
    }))
  }

  async function handleSubmit() {
    if (enabledCount === 0) {
      setError('Please enable at least one AI tool.')
      return
    }
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

  function resetForm() {
    if (confirm('Reset all form data?')) setFormData(DEFAULT_FORM)
  }

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: 'var(--bg)' }}>
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="pt-8 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <a href="/" className="text-xs font-mono transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ← Home
            </a>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>Audit</span>
          </div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            Your AI stack
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Toggle every tool you pay for. We'll find where you're overspending.
          </p>
        </div>

        {/* Live spend counter */}
        {totalSpend > 0 && (
          <div
            className="rounded-xl border p-4 mb-6 flex items-center justify-between"
            style={{ borderColor: 'var(--accent)', background: 'var(--accent-dim)' }}
          >
            <div>
              <div className="text-xs font-mono mb-0.5" style={{ color: 'var(--accent)' }}>
                CURRENT MONTHLY SPEND
              </div>
              <div
                className="text-2xl font-extrabold mono"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
              >
                ${fmt(totalSpend)}<span className="text-sm font-normal text-[var(--text-secondary)]">/mo</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                ${fmt(totalSpend * 12)}/year
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {enabledCount} tool{enabledCount !== 1 ? 's' : ''} tracked
              </div>
            </div>
          </div>
        )}

        {/* Team context */}
        <div
          className="rounded-xl border p-5 mb-5"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          <h2
            className="text-sm font-bold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            Team context
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
                Team size (people)
              </label>
              <input
                type="number"
                min={1}
                max={100000}
                value={formData.teamSize}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teamSize: Math.max(1, parseInt(e.target.value) || 1) }))
                }
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
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>
                Primary use case
              </label>
              <select
                value={formData.useCase}
                onChange={(e) => setFormData((prev) => ({ ...prev, useCase: e.target.value as UseCase }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
              >
                {(Object.keys(USE_CASE_LABELS) as UseCase[]).map((uc) => (
                  <option key={uc} value={uc}>{USE_CASE_LABELS[uc]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tool cards */}
        <div className="space-y-2.5 mb-6">
          <h2
            className="text-sm font-bold mb-3"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            AI tools{' '}
            <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
              — toggle every one you pay for
            </span>
          </h2>
          {formData.tools.map((tool) => (
            <ToolCard
              key={tool.toolId}
              tool={tool}
              onToggle={() => toggleTool(tool.toolId)}
              onUpdate={(updates) => updateTool(tool.toolId, updates)}
            />
          ))}
        </div>

        {/* Validation error */}
        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: 'var(--red)' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || enabledCount === 0}
            className="flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: enabledCount > 0 ? 'var(--accent)' : 'var(--bg-card)',
              color: enabledCount > 0 ? '#000' : 'var(--text-muted)',
              border: enabledCount > 0 ? 'none' : '1px solid var(--border)',
              fontFamily: 'Syne, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (enabledCount > 0) e.currentTarget.style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              if (enabledCount > 0) e.currentTarget.style.background = 'var(--accent)'
            }}
          >
            {loading
              ? 'Analysing your stack…'
              : enabledCount === 0
                ? 'Toggle at least one tool to continue'
                : `Run audit — ${enabledCount} tool${enabledCount > 1 ? 's' : ''} · $${fmt(totalSpend)}/mo →`}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-4 rounded-xl text-sm transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Reset all form data"
          >
            ↺
          </button>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Your inputs are saved automatically — come back anytime and they'll still be here.
        </p>
      </div>
    </div>
  )
}
