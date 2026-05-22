/**
 * Vercel Serverless Function: /api/summary
 * Calls Anthropic API server-side so the key is never exposed to the browser.
 * Returns { summary: string } or { summary: null, fallback: true } on failure.
 */

import Anthropic from '@anthropic-ai/sdk'

interface ToolResult {
  toolLabel: string
  currentPlan: string
  currentMonthlySpend: number
  recommendationType: string
  recommendedAction: string
  potentialMonthlySavings: number
}

interface SummaryRequest {
  toolResults: ToolResult[]
  totalCurrentMonthlySpend: number
  totalPotentialMonthlySavings: number
  totalPotentialAnnualSavings: number
  useCase: string
  teamSize: number
  savingsCategory: string
}

export default async function handler(
  req: { method: string; body: SummaryRequest },
  res: { status: (code: number) => { json: (data: object) => void } }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({ summary: null, fallback: true })
  }

  const data: SummaryRequest = req.body

  const toolSummary = data.toolResults
    .map((t) =>
      t.potentialMonthlySavings > 0
        ? `${t.toolLabel} (${t.currentPlan}, $${t.currentMonthlySpend}/mo): ${t.recommendedAction} — saves $${t.potentialMonthlySavings}/mo`
        : `${t.toolLabel} (${t.currentPlan}, $${t.currentMonthlySpend}/mo): already optimal`
    )
    .join('\n')

  const prompt = `You are a concise, direct financial advisor for startups. A team just completed an AI tool spend audit. Write an 80-100 word personalized summary paragraph. Be specific with dollar amounts. Mention the single highest-impact recommendation. End with one clear next step. Plain prose only — no bullets, no headers.

Team: ${data.teamSize} people, primary use: ${data.useCase}
Monthly AI spend: $${data.totalCurrentMonthlySpend}
Potential monthly savings: $${data.totalPotentialMonthlySavings} ($${data.totalPotentialAnnualSavings}/yr)

Tools:
${toolSummary}`

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    const summary =
      message.content[0].type === 'text' ? message.content[0].text : null
    return res.status(200).json({ summary, fallback: false })
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(200).json({ summary: null, fallback: true })
  }
}
