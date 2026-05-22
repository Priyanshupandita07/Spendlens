// ─── Tool & Plan Definitions ──────────────────────────────────────────────────

export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

export const TOOL_LABELS: Record<ToolId, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
}

export const TOOL_ICONS: Record<ToolId, string> = {
  cursor: '⌥',
  github_copilot: '◎',
  claude: '◈',
  chatgpt: '◉',
  anthropic_api: '◇',
  openai_api: '○',
  gemini: '◆',
  windsurf: '◀',
}

export const USE_CASE_LABELS: Record<UseCase, string> = {
  coding: 'Coding / Engineering',
  writing: 'Writing / Content',
  data: 'Data Analysis',
  research: 'Research',
  mixed: 'Mixed / General',
}

export const TOOL_PLANS: Record<ToolId, { id: string; label: string }[]> = {
  cursor: [
    { id: 'hobby', label: 'Hobby (Free)' },
    { id: 'pro', label: 'Pro — $20/user/mo' },
    { id: 'business', label: 'Business — $40/user/mo' },
    { id: 'enterprise', label: 'Enterprise (custom)' },
  ],
  github_copilot: [
    { id: 'individual', label: 'Individual — $10/user/mo' },
    { id: 'business', label: 'Business — $19/user/mo' },
    { id: 'enterprise', label: 'Enterprise — $39/user/mo' },
  ],
  claude: [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro — $20/user/mo' },
    { id: 'max', label: 'Max — $100/user/mo' },
    { id: 'team', label: 'Team — $25/user/mo (min 5)' },
    { id: 'enterprise', label: 'Enterprise (custom)' },
    { id: 'api', label: 'API Direct' },
  ],
  chatgpt: [
    { id: 'plus', label: 'Plus — $20/user/mo' },
    { id: 'team', label: 'Team — $30/user/mo' },
    { id: 'enterprise', label: 'Enterprise (custom)' },
    { id: 'api', label: 'API Direct' },
  ],
  anthropic_api: [{ id: 'api', label: 'API (pay-as-you-go)' }],
  openai_api: [{ id: 'api', label: 'API (pay-as-you-go)' }],
  gemini: [
    { id: 'advanced', label: 'Gemini Advanced — $19.99/mo' },
    { id: 'api', label: 'API Direct' },
  ],
  windsurf: [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro — $15/user/mo' },
    { id: 'team', label: 'Team — $35/user/mo' },
  ],
}

// ─── Form State ───────────────────────────────────────────────────────────────

export interface ToolEntry {
  toolId: ToolId
  plan: string
  monthlySpend: number
  seats: number
  enabled: boolean
}

export interface AuditFormData {
  tools: ToolEntry[]
  teamSize: number
  useCase: UseCase
}

// ─── Audit Engine ─────────────────────────────────────────────────────────────

export type RecommendationType =
  | 'downgrade_plan'
  | 'switch_tool'
  | 'right_sized'
  | 'overpaying_retail'
  | 'already_optimal'
  | 'consider_credits'

export interface ToolAuditResult {
  toolId: ToolId
  toolLabel: string
  currentPlan: string
  currentMonthlySpend: number
  seats: number
  recommendationType: RecommendationType
  recommendedAction: string
  reasoningNote: string
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  credexOpportunity: boolean
  alternativeTool?: string
  alternativePlan?: string
  alternativeCostPerSeat?: number
}

export interface AuditSummary {
  totalCurrentMonthlySpend: number
  totalPotentialMonthlySavings: number
  totalPotentialAnnualSavings: number
  toolResults: ToolAuditResult[]
  savingsCategory: 'high' | 'medium' | 'low' | 'optimal'
  aiSummary?: string
}

// ─── Lead / Storage ───────────────────────────────────────────────────────────

export interface LeadData {
  auditId: string
  email: string
  companyName?: string
  role?: string
  teamSize?: number
  totalMonthlySavings: number
}

export interface StoredAudit {
  id: string
  audit_data: AuditFormData
  audit_summary: AuditSummary
  created_at: string
  email?: string
  company_name?: string
  role?: string
}
