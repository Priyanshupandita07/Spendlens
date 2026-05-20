/**
 * PRICING DATA
 * All prices verified from official vendor pricing pages.
 * See PRICING_DATA.md at repo root for full source citations.
 * Last verified: 2025-05-20
 */

export interface PlanPrice {
  planId: string
  label: string
  pricePerSeatPerMonth: number // 0 = free, -1 = custom/enterprise
  minSeats?: number
  notes?: string
  bestFor?: string[]
}

export const PRICING: Record<string, PlanPrice[]> = {
  cursor: [
    {
      planId: 'hobby',
      label: 'Hobby',
      pricePerSeatPerMonth: 0,
      notes: 'Limited completions per month',
      bestFor: ['solo', 'light use'],
    },
    {
      planId: 'pro',
      label: 'Pro',
      pricePerSeatPerMonth: 20,
      notes: 'Unlimited completions, access to frontier models',
      bestFor: ['individual developers', 'heavy daily use'],
    },
    {
      planId: 'business',
      label: 'Business',
      pricePerSeatPerMonth: 40,
      notes: 'SSO, audit logs, centralized billing, privacy mode',
      bestFor: ['teams needing compliance', 'enterprise security'],
    },
    {
      planId: 'enterprise',
      label: 'Enterprise',
      pricePerSeatPerMonth: -1,
      notes: 'Custom contracts, dedicated support',
    },
  ],

  github_copilot: [
    {
      planId: 'individual',
      label: 'Individual',
      pricePerSeatPerMonth: 10,
      notes: 'Also available at $100/year',
      bestFor: ['solo developers', 'freelancers'],
    },
    {
      planId: 'business',
      label: 'Business',
      pricePerSeatPerMonth: 19,
      notes: 'Policy management, audit logs',
      bestFor: ['small to medium teams'],
    },
    {
      planId: 'enterprise',
      label: 'Enterprise',
      pricePerSeatPerMonth: 39,
      notes: 'Copilot Chat, fine-tuning, security features',
      bestFor: ['large orgs, compliance needs'],
    },
  ],

  claude: [
    {
      planId: 'free',
      label: 'Free',
      pricePerSeatPerMonth: 0,
      notes: 'Limited messages per day',
      bestFor: ['light/occasional use'],
    },
    {
      planId: 'pro',
      label: 'Pro',
      pricePerSeatPerMonth: 20,
      notes: '5x more usage than Free, priority access',
      bestFor: ['individual power users'],
    },
    {
      planId: 'max',
      label: 'Max',
      pricePerSeatPerMonth: 100,
      notes: '5x more usage than Pro, early feature access',
      bestFor: ['heavy API users, researchers'],
    },
    {
      planId: 'team',
      label: 'Team',
      pricePerSeatPerMonth: 25,
      minSeats: 5,
      notes: 'Min 5 seats, admin console, shared Projects',
      bestFor: ['teams of 5+ needing collaboration'],
    },
    {
      planId: 'enterprise',
      label: 'Enterprise',
      pricePerSeatPerMonth: -1,
      notes: 'SSO, SCIM, custom context windows',
    },
    {
      planId: 'api',
      label: 'API Direct',
      pricePerSeatPerMonth: 0,
      notes: 'Pay-per-token, highly variable',
    },
  ],

  chatgpt: [
    {
      planId: 'plus',
      label: 'Plus',
      pricePerSeatPerMonth: 20,
      notes: 'GPT-4o, DALL-E, Advanced Data Analysis',
      bestFor: ['individual power users'],
    },
    {
      planId: 'team',
      label: 'Team',
      pricePerSeatPerMonth: 30,
      minSeats: 2,
      notes: 'Higher limits, admin workspace, no training on data',
      bestFor: ['small teams needing admin controls'],
    },
    {
      planId: 'enterprise',
      label: 'Enterprise',
      pricePerSeatPerMonth: -1,
      notes: 'SSO, extended context, custom limits',
    },
    {
      planId: 'api',
      label: 'API Direct',
      pricePerSeatPerMonth: 0,
      notes: 'Pay-per-token',
    },
  ],

  anthropic_api: [
    {
      planId: 'api',
      label: 'API Direct',
      pricePerSeatPerMonth: 0,
      notes: 'Pay-per-token. Claude 3.5 Sonnet: $3/M input, $15/M output tokens',
    },
  ],

  openai_api: [
    {
      planId: 'api',
      label: 'API Direct',
      pricePerSeatPerMonth: 0,
      notes: 'Pay-per-token. GPT-4o: $2.50/M input, $10/M output tokens',
    },
  ],

  gemini: [
    {
      planId: 'advanced',
      label: 'Gemini Advanced',
      pricePerSeatPerMonth: 19.99,
      notes: 'Part of Google One AI Premium plan, 2TB storage included',
      bestFor: ['Google Workspace users', 'general AI tasks'],
    },
    {
      planId: 'api',
      label: 'API Direct',
      pricePerSeatPerMonth: 0,
      notes: 'Pay-per-token via Google AI Studio / Vertex AI',
    },
  ],

  windsurf: [
    {
      planId: 'free',
      label: 'Free',
      pricePerSeatPerMonth: 0,
      notes: 'Limited Flow Actions per month',
      bestFor: ['occasional use, evaluation'],
    },
    {
      planId: 'pro',
      label: 'Pro',
      pricePerSeatPerMonth: 15,
      notes: 'Unlimited completions, priority access to models',
      bestFor: ['individual developers'],
    },
    {
      planId: 'team',
      label: 'Team',
      pricePerSeatPerMonth: 35,
      notes: 'Team management, centralized billing',
      bestFor: ['dev teams needing shared controls'],
    },
  ],
}

export function getPlanPrice(toolId: string, planId: string): number {
  const plans = PRICING[toolId]
  if (!plans) return 0
  const plan = plans.find((p) => p.planId === planId)
  return plan?.pricePerSeatPerMonth ?? 0
}

export function getPlanMinSeats(toolId: string, planId: string): number {
  const plans = PRICING[toolId]
  if (!plans) return 1
  const plan = plans.find((p) => p.planId === planId)
  return plan?.minSeats ?? 1
}
