const rateLimitMap = new Map()

function isRateLimited(ip) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.body.honeypot) {
    return res.status(200).json({ ok: true })
  }

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { auditId, email, companyName, role, teamSize, totalMonthlySavings } = req.body

  if (!email || !auditId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          audit_id: auditId,
          email,
          company_name: companyName,
          role,
          team_size: teamSize,
          total_monthly_savings: totalMonthlySavings,
          created_at: new Date().toISOString(),
        }),
      })
    } catch (err) {
      console.error('Supabase error:', err)
    }
  }

  return res.status(200).json({ ok: true })
}
