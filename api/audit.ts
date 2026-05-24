/**
 * Vercel Serverless Function: GET /api/audit/:id
 * Returns public audit data (PII stripped) for shareable URLs.
 */

import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: {
    method: string
    query: { id?: string }
  },
  res: { status: (code: number) => { json: (data: object) => void } }
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing audit id' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Storage not configured' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('audits')
      .select('id, audit_data, audit_summary, created_at')
      // Intentionally NOT selecting email, company_name, role — public view strips PII
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Supabase fetch error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
