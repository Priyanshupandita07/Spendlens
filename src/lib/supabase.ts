import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isConfigured) {
  console.info('Supabase not configured — audit storage and lead capture disabled.')
}

export async function saveAudit(
  auditData: object,
  auditSummary: object,
  id: string
): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('audits').insert({
      id,
      audit_data: auditData,
      audit_summary: auditSummary,
      created_at: new Date().toISOString(),
    })
    return !error
  } catch {
    return false
  }
}

export async function getAudit(id: string) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function saveLead(lead: object): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('leads').insert(lead)
    return !error
  } catch {
    return false
  }
}
