import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { runAudit } from '@/lib/auditEngine'
import { saveAudit } from '@/lib/supabase'
import { nanoid } from 'nanoid'
import type { AuditFormData, ToolEntry, ToolId, UseCase } from '@/types'
import { TOOL_LABELS, TOOL_ICONS, TOOL_PLANS, USE_CASE_LABELS } from '@/types'

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

export default function AuditPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useLocalStorage<AuditFormData>(
    'spendlens_form',
    DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const enabledCount = formData.tools.filter((t) => t.enabled).length

  function updateTool(toolId: ToolId, updates: Partial<ToolEntry>) {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.toolId === toolId ? { ...t, ...updates } : t
      ),
    }))
  }

  function toggleTool(toolId: ToolId) {
    const tool = formData.tools.find((t) => t.toolId === toolId)
    if (!tool) return
    const wasEnabled = tool.enabled
    updateTool(toolId, {
      enabled: !wasEnabled,
      // Auto-set spend from plan price when enabling
      monthlySpend:
        !wasEnabled && tool.monthlySpend === 0
          ? tool.seats *
            (TOOL_PLANS[toolId].find((p) => p.id === tool.plan)?.label
              .match(/\$(\d+)/)
              ?.map(Number)[1] ?? 0)
          : tool.monthlySpend,
    })
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

      // Save to Supabase (non-blocking — don't fail if it errors)
      await saveAudit(formData, summary, id).catch(() => {})

      // Store in sessionStorage for the results page
      sessionStorage.setItem(
        `audit_${id}`,
        JSON.stringify({ formData, summary })
      )

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
    <div
      className="min-h-screen pt-20 pb-24"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 pt-8">
          <div
            className="text-xs font-mono mb-3"
            style={{ color: 'var(--accent)' }}
          >
            STEP 1 OF 2
          </div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            Your AI stack
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Toggle on every tool you pay for. We'll do the math.
          </p>
        </div>

        {/* Team context */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            Team context
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="text-xs mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Team size
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={formData.teamSize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamSize: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--accent)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
              />
            </div>
            <div>
              <label
                className="text-xs mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Primary use case
              </label>
              <select
                value={formData.useCase}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    useCase: e.target.value as UseCase,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--accent)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
              >
                {(Object.keys(USE_CASE_LABELS) as UseCase[]).map((uc) => (
                  <option key={uc} value={uc}>
                    {USE_CASE_LABELS[uc]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tool cards */}
        <div className="space-y-3 mb-6">
          {formData.tools.map((tool) => {
            const plans = TOOL_PLANS[tool.toolId]
            return (
              <div
                key={tool.toolId}
                className="rounded-xl border transition-all duration-200"
                style={{
                  borderColor: tool.enabled
                    ? 'var(--accent)'
                    : 'var(--border)',
                  background: tool.enabled
                    ? 'var(--accent-dim)'
                    : 'var(--bg-card)',
                }}
              >
                {/* Tool header row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleTool(tool.toolId)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: tool.enabled
                        ? 'var(--accent)'
                        : 'var(--border-hover)',
                      background: tool.enabled ? 'var(--accent)' : 'transparent',
                    }}
                    aria-label={`Toggle ${TOOL_LABELS[tool.toolId]}`}
                  >
                    {tool.enabled && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#000"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  <span
                    className="text-lg w-6 text-center"
                    style={{ color: tool.enabled ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    {TOOL_ICONS[tool.toolId]}
                  </span>

                  <button
                    onClick={() => toggleTool(tool.toolId)}
                    className="flex-1 text-left"
                  >
                    <span
                      className="font-semibold text-sm"
                      style={{
                        fontFamily: 'Syne, sans-serif',
                        color: tool.enabled
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {TOOL_LABELS[tool.toolId]}
                    </span>
                  </button>

                  {!tool.enabled && (
                    <span
                      className="text-xs font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      not using
                    </span>
                  )}
                </div>

                {/* Expanded inputs */}
                {tool.enabled && (
                  <div className="px-4 pb-4 grid grid-cols-3 gap-3">
                    {/* Plan */}
                    <div>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Plan
                      </label>
                      <select
                        value={tool.plan}
                        onChange={(e) =>
                          updateTool(tool.toolId, { plan: e.target.value })
                        }
                        className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-hover)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Seats
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={tool.seats}
                        onChange={(e) =>
                          updateTool(tool.toolId, {
                            seats: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    {/* Monthly spend */}
                    <div>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Monthly spend ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={tool.monthlySpend}
                        onChange={(e) =>
                          updateTool(tool.toolId, {
                            monthlySpend: Math.max(
                              0,
                              parseFloat(e.target.value) || 0
                            ),
                          })
                        }
                        className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-hover)',
                          color: 'var(--text-primary)',
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-sm mb-4 text-center"
            style={{ color: 'var(--red)' }}
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || enabledCount === 0}
            className="flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {loading
              ? 'Analysing…'
              : `Run audit${enabledCount > 0 ? ` (${enabledCount} tool${enabledCount > 1 ? 's' : ''})` : ''} →`}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-4 rounded-xl text-sm transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Reset
          </button>
        </div>

        <p
          className="text-xs text-center mt-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Form state is saved in your browser. Resume anytime.
        </p>
      </div>
    </div>
  )
}
