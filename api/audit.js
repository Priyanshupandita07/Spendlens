export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = req.query.id
  if (!id) return res.status(400).json({ error: 'Missing audit id' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Storage not configured' })
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/audits?id=eq.${id}&select=id,audit_data,audit_summary,created_at`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )
    const data = await response.json()
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Audit not found' })
    }
    return res.status(200).json(data[0])
  } catch (err) {
    console.error('Supabase error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
