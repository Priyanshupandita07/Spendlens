# PROMPTS.md

All LLM prompts used in SpendLens, with reasoning and iteration notes.

---

## Prompt 1: AI Audit Summary (Production)

**Used in:** `api/summary.ts` → called from `src/hooks/useAISummary.ts`  
**Model:** claude-sonnet-4-20250514  
**Max tokens:** 200

### Full Prompt

```
You are a concise, direct financial advisor for startups. A team just completed
an AI tool spend audit. Write an 80-100 word personalized summary paragraph.
Be specific with dollar amounts. Mention the single highest-impact recommendation.
End with one clear next step. Plain prose only — no bullets, no headers.

Team: {teamSize} people, primary use: {useCase}
Monthly AI spend: ${totalCurrentMonthlySpend}
Potential monthly savings: ${totalPotentialMonthlySavings} (${totalPotentialAnnualSavings}/yr)

Tools:
{per-tool lines: label, plan, spend, recommendation, savings}
```

### Why written this way

**"financial advisor for startups"** — Sets a direct, numbers-focused persona.
Early versions used "helpful assistant" and produced generic, encouraging output.
Financial advisor framing produces crisper, more actionable summaries.

**"80-100 word" constraint** — Without it, Claude writes 200-300 word essays.
The block has limited UI space and users won't read long summaries.

**"Be specific with dollar amounts"** — Without this the model writes "you could
save significantly" instead of "you could save $240/mo." Dollar amounts are what
make it feel personalized.

**"single highest-impact recommendation"** — Early prompts said "summarize all
recommendations" and produced lists. One clear focus is more actionable.

**"Plain prose only — no bullets, no headers"** — Without this, Claude adds
markdown that renders as raw symbols in the UI.

---

### What didn't work

**Attempt 1 — Too open-ended:**
Prompt: "Summarize this AI spend audit for the user."
Result: Generic 3-paragraph essay, no dollar amounts, not personalized.

**Attempt 2 — Too restrictive:**
Prompt: "Write exactly 2 sentences. First: total savings. Second: top recommendation."
Result: Robotic, felt templated, no useful context.

**Attempt 3 — Wrong persona:**
Prompt: "You are a friendly AI assistant helping a founder understand their results."
Result: Downplayed problems. "You're doing great but there's a small opportunity!"

---

## Fallback Template

When the API is unavailable, `generateFallback()` in `useAISummary.ts` runs:

**Optimal:** "Your {n}-person team is spending ${x}/mo efficiently. No obvious
overspend found. Re-run when your team or stack changes."

**Savings found:** "Your {n}-person team spends ${x}/mo. Our audit found
${savings}/mo (${annual}/yr) in potential savings. Biggest opportunity:
{tool} — {action}. Start there for the fastest win."

The fallback is intentionally simple and always accurate since it uses the
same numbers the audit engine already computed.

---

## AI Usage Philosophy

The audit engine uses zero AI — all rules are hardcoded TypeScript. This was
deliberate: AI audit logic would be unpredictable, untestable, and hard to
defend to a finance person. AI is used only for narrative synthesis of
structured data — a task where LLMs excel and minor inconsistency is acceptable.
