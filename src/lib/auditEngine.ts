/**
 * AUDIT ENGINE
 * Pure rule-based logic — no AI involved here (by design).
 * Every recommendation must be defensible to a finance-literate reader.
 * Each rule cites the reasoning explicitly in reasoningNote.
 */

import type {
  AuditFormData,
  AuditSummary,
  ToolAuditResult,
  ToolEntry,
  UseCase,
} from '@/types'
import { getPlanPrice } from './pricing'

// ─── Individual Tool Auditors ─────────────────────────────────────────────────

function auditCursor(entry: ToolEntry, _useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'cursor',
    toolLabel: 'Cursor',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Business plan for <5 users — Pro is identical for core usage
  if (plan === 'business' && seats < 5) {
    const savings = (40 - 20) * seats
    return {
      ...base,
      recommendationType: 'downgrade_plan',
      recommendedAction: `Downgrade to Cursor Pro ($20/seat)`,
      reasoningNote: `Business adds SSO and audit logs — useful for 10+ person orgs with compliance needs. At ${seats} seat(s), you get identical AI features on Pro for half the price. The $${savings}/mo premium buys admin tooling you likely don't need yet.`,
      potentialMonthlySavings: savings,
      potentialAnnualSavings: savings * 12,
      credexOpportunity: savings > 50,
    } as ToolAuditResult
  }

  // Enterprise — flag as unknown cost, suggest confirming value
  if (plan === 'enterprise') {
    return {
      ...base,
      recommendationType: 'consider_credits',
      recommendedAction: 'Audit enterprise contract against actual usage',
      reasoningNote: `Enterprise contracts often include capabilities far beyond what small teams use. Verify you're using SSO, audit logs, and dedicated support before renewal. Credex may offer equivalent access at a discount.`,
      potentialMonthlySavings: monthlySpend * 0.15,
      potentialAnnualSavings: monthlySpend * 0.15 * 12,
      credexOpportunity: true,
    } as ToolAuditResult
  }

  // Pro at correct usage — optimal
  if (plan === 'pro') {
    return {
      ...base,
      recommendationType: 'already_optimal',
      recommendedAction: 'No changes needed',
      reasoningNote: `Cursor Pro at $20/seat is the right call for active developers. Unlimited completions with frontier model access — this is competitive pricing for daily coding use.`,
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'You are on the free tier — no spend to optimize.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditGithubCopilot(entry: ToolEntry, useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'github_copilot',
    toolLabel: 'GitHub Copilot',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Enterprise for <10 users — rarely justified
  if (plan === 'enterprise' && seats < 10) {
    const savings = (39 - 19) * seats
    return {
      ...base,
      recommendationType: 'downgrade_plan',
      recommendedAction: `Downgrade to Copilot Business ($19/seat) — saves $${savings}/mo`,
      reasoningNote: `Copilot Enterprise adds fine-tuned models on your codebase and Copilot Chat in GitHub.com — valuable for large orgs. At ${seats} seats, the $20/seat premium ($${savings}/mo) is hard to justify unless you're actively using org-specific fine-tuning.`,
      potentialMonthlySavings: savings,
      potentialAnnualSavings: savings * 12,
      credexOpportunity: savings > 100,
    } as ToolAuditResult
  }

  // Copilot for non-coding use cases — wrong tool
  if (useCase !== 'coding' && useCase !== 'mixed') {
    const savings = monthlySpend
    return {
      ...base,
      recommendationType: 'switch_tool',
      recommendedAction: `Switch to Claude Pro or ChatGPT Plus for ${useCase} tasks`,
      reasoningNote: `GitHub Copilot is purpose-built for code completion inside an IDE. For ${useCase} work, you're paying for a tool that doesn't match your primary workflow. Claude Pro ($20/user) or ChatGPT Plus ($20/user) would deliver more value for your use case.`,
      potentialMonthlySavings: savings * 0.5,
      potentialAnnualSavings: savings * 0.5 * 12,
      alternativeTool: 'Claude Pro',
      alternativeCostPerSeat: 20,
    } as ToolAuditResult
  }

  // Individual plan — annual billing saves 17%
  if (plan === 'individual') {
    const annualSavings = monthlySpend * seats * 0.17
    return {
      ...base,
      recommendationType: 'already_optimal',
      recommendedAction: 'Switch to annual billing to save ~17%',
      reasoningNote: `At $10/mo or $100/year, switching to annual saves ~$20/user/year. At ${seats} seat(s) that's ~$${Math.round(annualSavings)}/year with no capability change.`,
      potentialMonthlySavings: Math.round(annualSavings / 12),
      potentialAnnualSavings: Math.round(annualSavings),
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'GitHub Copilot Business is well-priced for coding teams at this seat count.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditClaude(entry: ToolEntry, _useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'claude',
    toolLabel: 'Claude',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Max plan — only justified for very heavy usage
  if (plan === 'max') {
    const savings = (100 - 20) * seats
    return {
      ...base,
      recommendationType: 'downgrade_plan',
      recommendedAction: `Evaluate downgrade to Claude Pro ($20/seat) — saves $${savings}/mo`,
      reasoningNote: `Claude Max costs 5x Pro for 5x usage limits. Unless your team consistently hits Pro's daily limits, you're pre-paying for capacity you don't use. Monitor actual usage for 1 week — if you rarely hit limits, downgrade saves $${savings}/mo at ${seats} seat(s).`,
      potentialMonthlySavings: savings,
      potentialAnnualSavings: savings * 12,
      credexOpportunity: true,
    } as ToolAuditResult
  }

  // Team plan for <5 users — can't even use it, min seats is 5
  if (plan === 'team' && seats < 5) {
    const savings = (25 - 20) * seats
    return {
      ...base,
      recommendationType: 'downgrade_plan',
      recommendedAction: `Switch to Claude Pro ($20/seat) — saves $${savings}/mo`,
      reasoningNote: `Claude Team requires a minimum of 5 seats. At ${seats} seat(s), you're either overpaying unnecessarily or misreporting seat count. Claude Pro gives identical model access for $20/seat with no minimum.`,
      potentialMonthlySavings: savings,
      potentialAnnualSavings: savings * 12,
    } as ToolAuditResult
  }

  // Pro — optimal for individuals
  if (plan === 'pro') {
    return {
      ...base,
      recommendationType: 'already_optimal',
      recommendedAction: 'No changes needed',
      reasoningNote: 'Claude Pro at $20/seat is competitive for a frontier reasoning model with generous limits.',
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'Claude spend looks appropriate for your plan and seat count.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditChatGPT(entry: ToolEntry, useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'chatgpt',
    toolLabel: 'ChatGPT',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Both Claude Plus and ChatGPT Plus — likely redundant for non-coding
  if (plan === 'plus' && useCase === 'coding') {
    return {
      ...base,
      recommendationType: 'switch_tool',
      recommendedAction: 'Replace with Cursor or GitHub Copilot for coding tasks',
      reasoningNote: `For coding, an IDE-native tool (Cursor at $20/seat or Copilot at $10/seat) delivers far more value than ChatGPT — inline completions, refactoring, and context-aware edits without copy-pasting. ChatGPT Plus is better suited for writing, research, and general tasks.`,
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      alternativeTool: 'Cursor',
      alternativeCostPerSeat: 20,
    } as ToolAuditResult
  }

  // Team plan for 2 users — only $10/seat premium but worth flagging
  if (plan === 'team' && seats <= 2) {
    const savings = (30 - 20) * seats
    return {
      ...base,
      recommendationType: 'downgrade_plan',
      recommendedAction: `Downgrade to ChatGPT Plus ($20/seat) — saves $${savings}/mo`,
      reasoningNote: `ChatGPT Team adds admin console and no-training-on-data guarantees. At ${seats} user(s), you can get the same model access on Plus for $20/seat. The Team plan's admin features only matter at 5+ users.`,
      potentialMonthlySavings: savings,
      potentialAnnualSavings: savings * 12,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'ChatGPT spend is appropriate for your plan and use case.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditAPITool(
  entry: ToolEntry,
  toolId: 'anthropic_api' | 'openai_api'
): ToolAuditResult {
  const { monthlySpend, seats } = entry
  const isAnthropic = toolId === 'anthropic_api'
  const label = isAnthropic ? 'Anthropic API' : 'OpenAI API'

  const base: Partial<ToolAuditResult> = {
    toolId,
    toolLabel: label,
    currentPlan: 'api',
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // High API spend — Credex credits opportunity
  if (monthlySpend > 500) {
    return {
      ...base,
      recommendationType: 'consider_credits',
      recommendedAction: 'Explore discounted API credits via Credex',
      reasoningNote: `At $${monthlySpend}/mo on ${label}, you're paying retail token prices. Credex sources discounted AI infrastructure credits from companies that overforecast — the same API access at a reduced rate. At your spend level, savings can be material.`,
      potentialMonthlySavings: monthlySpend * 0.2,
      potentialAnnualSavings: monthlySpend * 0.2 * 12,
      credexOpportunity: true,
    } as ToolAuditResult
  }

  if (monthlySpend > 100) {
    return {
      ...base,
      recommendationType: 'overpaying_retail',
      recommendedAction: 'Review model selection — cheaper models may suffice',
      reasoningNote: `Check if you're using the most capable (and expensive) models for all tasks. GPT-4o-mini or Claude Haiku cost 10-20x less than frontier models for tasks like classification, summarisation, or structured extraction where full capability isn't needed.`,
      potentialMonthlySavings: monthlySpend * 0.3,
      potentialAnnualSavings: monthlySpend * 0.3 * 12,
      credexOpportunity: monthlySpend > 300,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'API spend looks reasonable at this level',
    reasoningNote: `At $${monthlySpend}/mo, this is light API usage. No immediate action needed — revisit if spend grows past $200/mo.`,
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditGemini(entry: ToolEntry, useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'gemini',
    toolLabel: 'Gemini',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Gemini Advanced for coding — wrong tool
  if (plan === 'advanced' && useCase === 'coding') {
    const savings = monthlySpend - 10
    return {
      ...base,
      recommendationType: 'switch_tool',
      recommendedAction: 'Switch to GitHub Copilot Individual ($10/seat) for coding',
      reasoningNote: `Gemini Advanced is a general-purpose assistant — it lacks IDE integration that makes AI coding tools valuable. GitHub Copilot Individual at $10/seat gives inline completions, refactoring, and chat inside your editor. That's a $${savings}/mo saving per seat with better coding productivity.`,
      potentialMonthlySavings: savings * seats,
      potentialAnnualSavings: savings * seats * 12,
      alternativeTool: 'GitHub Copilot',
      alternativeCostPerSeat: 10,
    } as ToolAuditResult
  }

  // Google Workspace users — Gemini Advanced may already be included
  if (plan === 'advanced') {
    return {
      ...base,
      recommendationType: 'right_sized',
      recommendedAction: 'Verify Gemini is not already included in your Google Workspace plan',
      reasoningNote: `Google Workspace Business Starter/Standard plans include Gemini features. If your team already pays for Google Workspace, you may be double-paying — check your Google Admin console before renewing Gemini Advanced separately.`,
      potentialMonthlySavings: monthlySpend * 0.5,
      potentialAnnualSavings: monthlySpend * 0.5 * 12,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'Gemini API usage — review model tier selection periodically.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

function auditWindsurf(entry: ToolEntry, useCase: UseCase): ToolAuditResult {
  const { plan, monthlySpend, seats } = entry
  const base: Partial<ToolAuditResult> = {
    toolId: 'windsurf',
    toolLabel: 'Windsurf',
    currentPlan: plan,
    currentMonthlySpend: monthlySpend,
    seats,
    credexOpportunity: false,
  }

  // Windsurf for non-coding — wrong tool
  if (useCase !== 'coding' && useCase !== 'mixed' && plan !== 'free') {
    return {
      ...base,
      recommendationType: 'switch_tool',
      recommendedAction: `Switch to Claude Pro ($20/seat) for ${useCase} tasks`,
      reasoningNote: `Windsurf is an AI-native IDE — it adds no value for ${useCase} work outside a code editor. Claude Pro at $20/seat is more capable for your actual use case.`,
      potentialMonthlySavings: monthlySpend,
      potentialAnnualSavings: monthlySpend * 12,
      alternativeTool: 'Claude Pro',
      alternativeCostPerSeat: 20,
    } as ToolAuditResult
  }

  // Team + Cursor overlap — likely redundant
  if (plan === 'team') {
    return {
      ...base,
      recommendationType: 'right_sized',
      recommendedAction: 'Audit if Windsurf Team and Cursor are both active',
      reasoningNote: `Windsurf Team at $35/seat and Cursor serve similar IDE AI roles. Running both is common during evaluation but expensive long-term. Pick one primary coding AI IDE and drop the other — most teams don't need both simultaneously.`,
      potentialMonthlySavings: monthlySpend,
      potentialAnnualSavings: monthlySpend * 12,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendationType: 'already_optimal',
    recommendedAction: 'No changes needed',
    reasoningNote: 'Windsurf Pro at $15/seat is competitive for an AI-native IDE.',
    potentialMonthlySavings: 0,
    potentialAnnualSavings: 0,
  } as ToolAuditResult
}

// ─── Overlap Detection ────────────────────────────────────────────────────────

function detectOverlaps(results: ToolAuditResult[], form: AuditFormData): void {
  const enabledTools = form.tools.filter((t) => t.enabled).map((t) => t.toolId)

  // Both Cursor and Windsurf active — likely redundant
  const hasCursor = enabledTools.includes('cursor')
  const hasWindsurf = enabledTools.includes('windsurf')
  if (hasCursor && hasWindsurf) {
    const windsurfResult = results.find((r) => r.toolId === 'windsurf')
    if (windsurfResult && windsurfResult.potentialMonthlySavings === 0) {
      windsurfResult.recommendationType = 'switch_tool'
      windsurfResult.recommendedAction =
        'Consolidate to one AI IDE — you are paying for both Cursor and Windsurf'
      windsurfResult.reasoningNote =
        'Running two AI-native IDEs simultaneously (Cursor + Windsurf) is redundant for most teams. They overlap significantly on features. Pick your preferred one and cancel the other — the second license is pure waste.'
      windsurfResult.potentialMonthlySavings = windsurfResult.currentMonthlySpend
      windsurfResult.potentialAnnualSavings = windsurfResult.currentMonthlySpend * 12
    }
  }

  // Both Claude and ChatGPT for non-coding — likely redundant
  const hasClaude = enabledTools.includes('claude')
  const hasChatGPT = enabledTools.includes('chatgpt')
  if (hasClaude && hasChatGPT && form.useCase !== 'mixed') {
    const chatgptResult = results.find((r) => r.toolId === 'chatgpt')
    if (chatgptResult && chatgptResult.potentialMonthlySavings === 0) {
      chatgptResult.recommendationType = 'switch_tool'
      chatgptResult.recommendedAction =
        'Pick one: Claude or ChatGPT — both cover the same use case'
      chatgptResult.reasoningNote =
        "For non-mixed workloads, running both Claude and ChatGPT is rarely justified. They're direct substitutes for writing, research, and data tasks. Pick the one your team prefers and cancel the other — you're doubling your LLM assistant budget for marginal capability gain."
      chatgptResult.potentialMonthlySavings = chatgptResult.currentMonthlySpend * 0.8
      chatgptResult.potentialAnnualSavings = chatgptResult.currentMonthlySpend * 0.8 * 12
    }
  }
}

// ─── Main Audit Function ──────────────────────────────────────────────────────

export function runAudit(form: AuditFormData): AuditSummary {
  const enabledTools = form.tools.filter((t) => t.enabled)
  const results: ToolAuditResult[] = []

  for (const entry of enabledTools) {
    let result: ToolAuditResult

    switch (entry.toolId) {
      case 'cursor':
        result = auditCursor(entry, form.useCase)
        break
      case 'github_copilot':
        result = auditGithubCopilot(entry, form.useCase)
        break
      case 'claude':
        result = auditClaude(entry, form.useCase)
        break
      case 'chatgpt':
        result = auditChatGPT(entry, form.useCase)
        break
      case 'anthropic_api':
        result = auditAPITool(entry, 'anthropic_api')
        break
      case 'openai_api':
        result = auditAPITool(entry, 'openai_api')
        break
      case 'gemini':
        result = auditGemini(entry, form.useCase)
        break
      case 'windsurf':
        result = auditWindsurf(entry, form.useCase)
        break
      default:
        continue
    }

    results.push(result)
  }

  // Run overlap detection — may mutate results
  detectOverlaps(results, form)

  const totalCurrentMonthlySpend = enabledTools.reduce(
    (sum, t) => sum + t.monthlySpend,
    0
  )
  const totalPotentialMonthlySavings = results.reduce(
    (sum, r) => sum + r.potentialMonthlySavings,
    0
  )
  const totalPotentialAnnualSavings = totalPotentialMonthlySavings * 12

  let savingsCategory: AuditSummary['savingsCategory']
  if (totalPotentialMonthlySavings >= 500) savingsCategory = 'high'
  else if (totalPotentialMonthlySavings >= 100) savingsCategory = 'medium'
  else if (totalPotentialMonthlySavings > 0) savingsCategory = 'low'
  else savingsCategory = 'optimal'

  return {
    totalCurrentMonthlySpend,
    totalPotentialMonthlySavings,
    totalPotentialAnnualSavings,
    toolResults: results,
    savingsCategory,
  }
}

// Re-export for convenience
export { getPlanPrice }
