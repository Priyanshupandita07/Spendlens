import { useState, useEffect } from 'react'
import type { AuditSummary, AuditFormData } from '@/types'

interface UseAISummaryResult {
  summary: string | null
  loading: boolean
  isFallback: boolean
}

export function useAISummary(
  auditSummary: AuditSummary | null,
  formData: AuditFormData | null
): UseAISummaryResult {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    if (!auditSummary || !formData) return
    setLoading(true)

    const payload = {
      toolResults: auditSummary.toolResults,
      totalCurrentMonthlySpend: auditSummary.totalCurrentMonthlySpend,
      totalPotentialMonthlySavings: auditSummary.totalPotentialMonthlySavings,
      totalPotentialAnnualSavings: auditSummary.totalPotentialAnnualSavings,
      useCase: formData.useCase,
      teamSize: formData.teamSize,
      savingsCategory: auditSummary.savingsCategory,
    }

    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data: { summary: string | null; fallback?: boolean }) => {
        if (data.summary) {
          setSummary(data.summary)
          setIsFallback(false)
        } else {
          setSummary(generateFallback(auditSummary, formData))
          setIsFallback(true)
        }
      })
      .catch(() => {
        setSummary(generateFallback(auditSummary, formData))
        setIsFallback(true)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { summary, loading, isFallback }
}

function generateFallback(summary: AuditSummary, formData: AuditFormData): string {
  const { totalCurrentMonthlySpend, totalPotentialMonthlySavings, totalPotentialAnnualSavings, savingsCategory, toolResults } = summary

  if (savingsCategory === 'optimal') {
    return `Your ${formData.teamSize}-person team is spending $${totalCurrentMonthlySpend}/mo on AI tools efficiently. No obvious overspend was found across your ${toolResults.length} active tool${toolResults.length > 1 ? 's' : ''}. Re-run this audit when your team size or tool stack changes.`
  }

  const top = [...toolResults].sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)[0]
  return `Your ${formData.teamSize}-person team spends $${totalCurrentMonthlySpend}/mo on AI tools. Our audit found $${totalPotentialMonthlySavings}/mo ($${totalPotentialAnnualSavings}/yr) in potential savings. The biggest opportunity: ${top.toolLabel} — ${top.recommendedAction.toLowerCase()}. Start there for the fastest win, then work through the remaining recommendations.`
}
