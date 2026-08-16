import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'dry_run_ready.json')
    const fileData = fs.readFileSync(filePath, 'utf8')
    const readyRows = JSON.parse(fileData)

    const results: { imported: number, duplicates: number, failed: number, errors: string[] } = {
      imported: 0,
      duplicates: 0,
      failed: 0,
      errors: []
    }

    const makesCache = new Map()
    const modelsCache = new Map()
    const servicesCache = new Map()

    for (const row of readyRows) {
      try {
        let makeId = makesCache.get(row.make)
        if (!makeId) {
          const { data: existingMake } = await supabase.from('vehicle_makes').select('id').ilike('name', row.make).maybeSingle()
          if (existingMake) {
            makeId = existingMake.id
          } else {
            const { data: insertedMake, error: makeError } = await supabase.from('vehicle_makes').insert({ name: row.make }).select('id').single()
            if (makeError) throw new Error(`Make Error: ${makeError.message}`)
            makeId = insertedMake.id
          }
          makesCache.set(row.make, makeId)
        }

        const modelKey = `${makeId}_${row.model}`
        let modelId = modelsCache.get(modelKey)
        if (!modelId) {
          const { data: existingModel } = await supabase.from('vehicle_models').select('id').eq('make_id', makeId).ilike('name', row.model).maybeSingle()
          if (existingModel) {
            modelId = existingModel.id
          } else {
            const { data: insertedModel, error: modelError } = await supabase.from('vehicle_models').insert({ make_id: makeId, name: row.model }).select('id').single()
            if (modelError) throw new Error(`Model Error: ${modelError.message}`)
            modelId = insertedModel.id
          }
          modelsCache.set(modelKey, modelId)
        }

        let serviceId = servicesCache.get(row.service)
        if (!serviceId) {
          const { data: existingService } = await supabase.from('labor_services').select('id').ilike('name', row.service).maybeSingle()
          if (existingService) {
            serviceId = existingService.id
          } else {
            const { data: insertedService, error: serviceError } = await supabase.from('labor_services').insert({ name: row.service, is_active: true }).select('id').single()
            if (serviceError) throw new Error(`Service Error: ${serviceError.message}`)
            serviceId = insertedService.id
          }
          servicesCache.set(row.service, serviceId)
        }

        // Insert Rate
        const { error: insertError } = await supabase.from('labor_lookup_rates').insert({
          labor_service_id: serviceId,
          vehicle_make_id: makeId,
          vehicle_model_id: modelId,
          year_from: row.year_from,
          year_to: row.year_to,
          labor_manual: row.labor_manual,
          labor_automatic: row.labor_automatic,
          notes: 'Imported from Google Sheet',
          is_active: true
        })

        if (insertError) {
          // If we hit RLS error here, it means the table structure changed and we have the columns
          throw new Error(`Rate Error: ${insertError.message}`)
        }

        results.imported++
      } catch (err: any) {
        results.failed++
        results.errors.push(`Row ${row.make} ${row.model} ${row.service}: ${err.message}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
