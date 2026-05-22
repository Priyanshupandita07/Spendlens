import { describe, it, expect } from 'vitest'
import { runAudit } from '@/lib/auditEngine'
import type { AuditFormData, ToolEntry } from '@/types'

function makeForm(tools: Partial<ToolEntry>[], useCase = 'coding' as const): AuditFormData {
  return {
    teamSize: 5,
    useCase,
    tools: tools.map((t) => ({
      toolId: t.toolId ?? 'cursor',
      plan: t.plan ?? 'pro',
      monthlySpend: t.monthlySpend ?? 100,
      seats: t.seats ?? 1,
      enabled: t.enabled ?? true,
    })),
  }
}

// ─── Test 1: Cursor Business overkill for small team ─────────────────────────
describe('Cursor audit', () => {
  it('recommends downgrade from Business to Pro for small teams (<5 seats)', () => {
    const form = makeForm([
      { toolId: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 },
    ])
    const result = runAudit(form)
    const cursorResult = result.toolResults.find((r) => r.toolId === 'cursor')!

    expect(cursorResult.recommendationType).toBe('downgrade_plan')
    // Business=$40, Pro=$20, 2 seats = $40 savings
    expect(cursorResult.potentialMonthlySavings).toBe(40)
    expect(cursorResult.potentialAnnualSavings).toBe(480)
  })

  it('marks Cursor Pro as already optimal', () => {
    const form = makeForm([
      { toolId: 'cursor', plan: 'pro', monthlySpend: 40, seats: 2 },
    ])
    const result = runAudit(form)
    const cursorResult = result.toolResults.find((r) => r.toolId === 'cursor')!

    expect(cursorResult.recommendationType).toBe('already_optimal')
    expect(cursorResult.potentialMonthlySavings).toBe(0)
  })
})

// ─── Test 2: Claude Max downgrade ────────────────────────────────────────────
describe('Claude audit', () => {
  it('flags Claude Max as over-provisioned and suggests Pro', () => {
    const form = makeForm([
      { toolId: 'claude', plan: 'max', monthlySpend: 200, seats: 2 },
    ])
    const result = runAudit(form)
    const claudeResult = result.toolResults.find((r) => r.toolId === 'claude')!

    expect(claudeResult.recommendationType).toBe('downgrade_plan')
    // Max=$100, Pro=$20, 2 seats = $160 savings
    expect(claudeResult.potentialMonthlySavings).toBe(160)
  })

  it('does not flag Claude Team for 5+ seats', () => {
    const form = makeForm([
      { toolId: 'claude', plan: 'team', monthlySpend: 125, seats: 5 },
    ])
    const result = runAudit(form)
    const claudeResult = result.toolResults.find((r) => r.toolId === 'claude')!

    expect(claudeResult.potentialMonthlySavings).toBe(0)
  })
})

// ─── Test 3: API spend triggers Credex opportunity above $500 ─────────────────
describe('API audit', () => {
  it('flags high Anthropic API spend as Credex opportunity', () => {
    const form = makeForm([
      { toolId: 'anthropic_api', plan: 'api', monthlySpend: 800, seats: 1 },
    ])
    const result = runAudit(form)
    const apiResult = result.toolResults.find((r) => r.toolId === 'anthropic_api')!

    expect(apiResult.credexOpportunity).toBe(true)
    expect(apiResult.recommendationType).toBe('consider_credits')
    expect(apiResult.potentialMonthlySavings).toBeGreaterThan(0)
  })

  it('does not flag low API spend as urgent', () => {
    const form = makeForm([
      { toolId: 'openai_api', plan: 'api', monthlySpend: 50, seats: 1 },
    ])
    const result = runAudit(form)
    const apiResult = result.toolResults.find((r) => r.toolId === 'openai_api')!

    expect(apiResult.recommendationType).toBe('already_optimal')
    expect(apiResult.potentialMonthlySavings).toBe(0)
  })
})

// ─── Test 4: Overlap detection — Cursor + Windsurf ────────────────────────────
describe('Overlap detection', () => {
  it('flags Windsurf as redundant when Cursor is also active', () => {
    const form = makeForm([
      { toolId: 'cursor', plan: 'pro', monthlySpend: 40, seats: 2 },
      { toolId: 'windsurf', plan: 'pro', monthlySpend: 30, seats: 2 },
    ])
    const result = runAudit(form)
    const windsurfResult = result.toolResults.find((r) => r.toolId === 'windsurf')!

    expect(windsurfResult.potentialMonthlySavings).toBeGreaterThan(0)
    expect(windsurfResult.recommendationType).toBe('switch_tool')
  })
})

// ─── Test 5: Total savings calculation ───────────────────────────────────────
describe('Summary totals', () => {
  it('correctly sums total monthly and annual savings across tools', () => {
    const form = makeForm([
      { toolId: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 },  // $40 savings
      { toolId: 'claude', plan: 'max', monthlySpend: 200, seats: 2 },      // $160 savings
    ])
    const result = runAudit(form)

    expect(result.totalPotentialMonthlySavings).toBe(200)
    expect(result.totalPotentialAnnualSavings).toBe(2400)
    expect(result.savingsCategory).toBe('medium')
  })

  it('classifies savings correctly into high/medium/low/optimal', () => {
    const highForm = makeForm([
      { toolId: 'anthropic_api', plan: 'api', monthlySpend: 3000, seats: 1 },
    ])
    expect(runAudit(highForm).savingsCategory).toBe('high')

    const optimalForm = makeForm([
      { toolId: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 },
    ])
    expect(runAudit(optimalForm).savingsCategory).toBe('optimal')
  })
})

// ─── Test 6: Wrong tool for use case ─────────────────────────────────────────
describe('Use-case fit', () => {
  it('flags Windsurf as wrong tool for writing use case', () => {
    const form: AuditFormData = {
      teamSize: 3,
      useCase: 'writing',
      tools: [
        {
          toolId: 'windsurf',
          plan: 'pro',
          monthlySpend: 45,
          seats: 3,
          enabled: true,
        },
      ],
    }
    const result = runAudit(form)
    const wsResult = result.toolResults.find((r) => r.toolId === 'windsurf')!

    expect(wsResult.recommendationType).toBe('switch_tool')
    expect(wsResult.potentialMonthlySavings).toBeGreaterThan(0)
  })
})

// ─── Test 7: GitHub Copilot Enterprise overkill for small team ────────────────
describe('GitHub Copilot audit', () => {
  it('recommends downgrade from Enterprise to Business for <10 seats', () => {
    const form = makeForm([
      { toolId: 'github_copilot', plan: 'enterprise', monthlySpend: 156, seats: 4 },
    ])
    const result = runAudit(form)
    const r = result.toolResults.find((r) => r.toolId === 'github_copilot')!

    expect(r.recommendationType).toBe('downgrade_plan')
    // Enterprise=$39, Business=$19, 4 seats = $80 savings
    expect(r.potentialMonthlySavings).toBe(80)
  })

  it('flags Copilot for non-coding use case', () => {
    const form: AuditFormData = {
      teamSize: 3,
      useCase: 'writing',
      tools: [
        { toolId: 'github_copilot', plan: 'business', monthlySpend: 57, seats: 3, enabled: true },
      ],
    }
    const result = runAudit(form)
    const r = result.toolResults.find((r) => r.toolId === 'github_copilot')!
    expect(r.recommendationType).toBe('switch_tool')
  })
})

// ─── Test 8: ChatGPT Team downgrade for small team ────────────────────────────
describe('ChatGPT audit', () => {
  it('recommends downgrade from Team to Plus for <=2 users', () => {
    const form = makeForm([
      { toolId: 'chatgpt', plan: 'team', monthlySpend: 60, seats: 2 },
    ])
    const result = runAudit(form)
    const r = result.toolResults.find((r) => r.toolId === 'chatgpt')!

    expect(r.recommendationType).toBe('downgrade_plan')
    // Team=$30, Plus=$20, 2 seats = $20 savings
    expect(r.potentialMonthlySavings).toBe(20)
  })
})

// ─── Test 9: Gemini for coding — wrong tool ───────────────────────────────────
describe('Gemini audit', () => {
  it('flags Gemini Advanced for coding use case — suggests Copilot', () => {
    const form: AuditFormData = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        { toolId: 'gemini', plan: 'advanced', monthlySpend: 40, seats: 2, enabled: true },
      ],
    }
    const result = runAudit(form)
    const r = result.toolResults.find((r) => r.toolId === 'gemini')!
    expect(r.recommendationType).toBe('switch_tool')
    expect(r.alternativeTool).toBe('GitHub Copilot')
  })
})

// ─── Test 10: Claude + ChatGPT overlap for non-mixed use case ─────────────────
describe('Claude + ChatGPT overlap', () => {
  it('flags ChatGPT as redundant when Claude is also active for research', () => {
    const form: AuditFormData = {
      teamSize: 3,
      useCase: 'research',
      tools: [
        { toolId: 'claude', plan: 'pro', monthlySpend: 60, seats: 3, enabled: true },
        { toolId: 'chatgpt', plan: 'plus', monthlySpend: 60, seats: 3, enabled: true },
      ],
    }
    const result = runAudit(form)
    const chatgptResult = result.toolResults.find((r) => r.toolId === 'chatgpt')!
    expect(chatgptResult.potentialMonthlySavings).toBeGreaterThan(0)
  })
})

// ─── Test 11: Disabled tools are excluded from audit ─────────────────────────
describe('Disabled tools', () => {
  it('does not include disabled tools in audit results', () => {
    const form: AuditFormData = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        { toolId: 'cursor', plan: 'pro', monthlySpend: 40, seats: 2, enabled: true },
        { toolId: 'claude', plan: 'pro', monthlySpend: 40, seats: 2, enabled: false },
      ],
    }
    const result = runAudit(form)
    expect(result.toolResults).toHaveLength(1)
    expect(result.toolResults[0].toolId).toBe('cursor')
  })
})

// ─── Test 12: Zero spend edge case ───────────────────────────────────────────
describe('Edge cases', () => {
  it('handles zero monthly spend without crashing', () => {
    const form = makeForm([
      { toolId: 'cursor', plan: 'pro', monthlySpend: 0, seats: 1 },
    ])
    expect(() => runAudit(form)).not.toThrow()
    const result = runAudit(form)
    expect(result.totalCurrentMonthlySpend).toBe(0)
  })
})
