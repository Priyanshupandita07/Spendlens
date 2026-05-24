export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({ summary: null, fallback: true })
  }

  const data = req.body
  const toolSummary = (data.toolResults || [])
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const json = await response.json()
    const summary = json.content?.[0]?.text || null
    return res.status(200).json({ summary, fallback: false })
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(200).json({ summary: null, fallback: true })
  }
}
