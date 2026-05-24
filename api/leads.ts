/**
 * Vercel Serverless Function: POST /api/leads
 * Saves lead data to Supabase and sends confirmation email via Resend.
 * Rate limited: max 5 requests per IP per hour (tracked in memory — good enough for MVP).
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// In-memory rate limiter (resets on cold start — fine for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (record.count >= 5) return true
  record.count++
  return false
}

interface LeadBody {
  auditId: string
  email: string
  companyName?: string
  role?: string
  teamSize?: number
  totalMonthlySavings: number
  honeypot?: string
}

export default async function handler(
  req: {
    method: string
    body: LeadBody
    headers: Record<string, string | string[] | undefined>
  },
  res: { status: (code: number) => { json: (data: object) => void } }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Honeypot check
  if (req.body.honeypot) {
    return res.status(200).json({ ok: true }) // silently accept bots
  }

  // Rate limit by IP
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { auditId, email, companyName, role, teamSize, totalMonthlySavings } = req.body

  if (!email || !auditId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Save to Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY // service key for server-side writes
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase.from('leads').insert({
        audit_id: auditId,
        email,
        company_name: companyName,
        role,
        team_size: teamSize,
        total_monthly_savings: totalMonthlySavings,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Supabase insert error:', err)
      // non-blocking — don't fail the request
    }
  }

  // Send confirmation email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      const isHighSavings = totalMonthlySavings >= 500
      const auditUrl = `${process.env.VITE_APP_URL || 'https://spendlens-ivory.vercel.app'}/results/${auditId}`

      await resend.emails.send({
        from: 'SpendLens <hello@spendlens.credex.rocks>',
        to: email,
        subject: isHighSavings
          ? `Your SpendLens audit — $${totalMonthlySavings}/mo in savings found`
          : 'Your SpendLens audit is ready',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fff;">
            <div style="margin-bottom: 24px;">
              <span style="background: #00e5a0; color: #000; font-weight: 700; padding: 6px 12px; border-radius: 6px; font-size: 14px;">SpendLens</span>
            </div>

            <h1 style="font-size: 24px; font-weight: 800; color: #111; margin: 0 0 8px;">
              ${isHighSavings
                ? `We found $${totalMonthlySavings}/mo in potential savings`
                : 'Your AI spend audit is complete'}
            </h1>

            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              ${isHighSavings
                ? `Your audit identified $${totalMonthlySavings}/mo ($${totalMonthlySavings * 12}/yr) in potential savings. A Credex advisor will be in touch within 1 business day to discuss how we can help you capture these savings through discounted AI credits.`
                : `Your audit is complete. We'll notify you when new savings opportunities open up for your AI stack.`}
            </p>

            <a href="${auditUrl}"
              style="display: inline-block; background: #00e5a0; color: #000; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; margin-bottom: 32px;">
              View your audit →
            </a>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              Built by <a href="https://credex.rocks" style="color: #00e5a0;">Credex</a> —
              AI infrastructure credits at a discount.<br/>
              You received this because you submitted an audit at SpendLens.
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend email error:', err)
      // non-blocking
    }
  }

  return res.status(200).json({ ok: true })
}
