import { SupabaseClient } from '@supabase/supabase-js'

export function normalizeString(str: string | null | undefined): string {
  if (!str) return ''
  return str.toLowerCase().replace(/\s+/g, ' ').trim()
}

export async function checkDuplicatePart(
  supabase: SupabaseClient,
  params: {
    name: string
    part_number: string | null
    brand_id: string | null
    category_id: string
    engine_oil_classification: string | null
    exclude_id?: string
  }
): Promise<boolean> {
  const { name, part_number, brand_id, category_id, engine_oil_classification, exclude_id } = params

  if (part_number && part_number.trim()) {
    let query = supabase.from('parts').select('id').ilike('part_number', part_number.trim())
    if (exclude_id) {
      query = query.neq('id', exclude_id)
    }
    const { data } = await query.limit(1)
    if (data && data.length > 0) return true
  }

  // Check without SKU
  let query = supabase.from('parts').select('id, name, brand_id, category_id, engine_oil_classification')
  if (exclude_id) {
    query = query.neq('id', exclude_id)
  }
  
  // We can't do normalized string equality efficiently in pure Postgrest without RPC,
  // so we fetch parts that share the same category_id and brand_id, then compare locally.
  query = query.eq('category_id', category_id)
  if (brand_id) {
    query = query.eq('brand_id', brand_id)
  } else {
    query = query.is('brand_id', null)
  }
  
  if (engine_oil_classification) {
    query = query.eq('engine_oil_classification', engine_oil_classification)
  } else {
    query = query.is('engine_oil_classification', null)
  }

  const { data } = await query
  
  if (data && data.length > 0) {
    const normalizedTargetName = normalizeString(name)
    for (const part of data) {
      if (normalizeString(part.name) === normalizedTargetName) {
        return true
      }
    }
  }

  return false
}

export async function checkDuplicateLabor(
  supabase: SupabaseClient,
  params: {
    name: string
    category_id: string
    exclude_id?: string
  }
): Promise<boolean> {
  const { name, category_id, exclude_id } = params

  let query = supabase.from('labor_services').select('id, name').eq('category_id', category_id)
  if (exclude_id) {
    query = query.neq('id', exclude_id)
  }

  const { data } = await query

  if (data && data.length > 0) {
    const normalizedTargetName = normalizeString(name)
    for (const labor of data) {
      if (normalizeString(labor.name) === normalizedTargetName) {
        return true
      }
    }
  }

  return false
}
