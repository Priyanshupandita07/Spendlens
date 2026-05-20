import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars not set — lead capture and audit storage will be disabled.'
  )
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export async function saveAudit(
  auditData: object,
  auditSummary: object,
  id: string
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('audits').insert({
    id,
    audit_data: auditData,
    audit_summary: auditSummary,
    created_at: new Date().toISOString(),
  })
  return !error
}

export async function getAudit(id: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function saveLead(lead: object): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('leads').insert(lead)
  return !error
}
