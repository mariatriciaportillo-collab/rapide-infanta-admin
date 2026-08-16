import * as fs from 'fs'

const dumpFile = '/Users/triciaportillo/.gemini/antigravity/brain/618526df-59ad-4e75-aaa9-46e4f0cac3af/scratch/labor_data_dump.json'

async function dryRun() {
  const data = JSON.parse(fs.readFileSync(dumpFile, 'utf8'))
  
  const summary = {
    total_rows: 0,
    ready: 0,
    needs_review: 0,
    invalid: 0
  }

  const outReady = []
  const outNeedsReview = []

  for (const sheetName of Object.keys(data)) {
    const rows = data[sheetName]
    
    // Skip empty or master list
    if (sheetName === 'MASTER LIST' || sheetName.toLowerCase().includes('copy') || sheetName.toLowerCase().includes('dashboar')) {
      continue
    }
    if (!rows || rows.length <= 1) continue

    const parts = sheetName.trim().split(' ')
    const makeName = parts[0].toUpperCase()
    const modelName = parts.slice(1).join(' ').toUpperCase()

    if (!makeName) continue

    const headerRow = rows[0]
    let colLaborM = null
    let colLaborAT = null
    let colRepair = null
    let colMaintenance = 'NEW STANDARD LABOR CHARGES'

    for (const [key, val] of Object.entries(headerRow)) {
      if (typeof val === 'string') {
        const v = val.toUpperCase().trim()
        if (v === 'LABOR M') colLaborM = key
        else if (v === 'LABOR AT') colLaborAT = key
        else if (v === 'REPAIR') colRepair = key
      }
    }

    // Process subsequent rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      summary.total_rows++
      
      const serviceNameRaw = row[colMaintenance]
      if (!serviceNameRaw || typeof serviceNameRaw !== 'string' || serviceNameRaw.trim() === '') {
        summary.invalid++
        continue
      }
      const serviceName = serviceNameRaw.trim().toUpperCase()

      let laborM = null
      let laborAT = null
      
      if (colLaborM && row[colLaborM] && !isNaN(parseFloat(row[colLaborM]))) laborM = parseFloat(row[colLaborM])
      if (colLaborAT && row[colLaborAT] && !isNaN(parseFloat(row[colLaborAT]))) laborAT = parseFloat(row[colLaborAT])

      // Ignore repair for now unless requested, but user said "Remove Repair If We Do Not Need It"

      if (laborM === null && laborAT === null) {
        // If neither exists, flag for review
        summary.needs_review++
        outNeedsReview.push({ sheetName, row: i+2, serviceName, reason: "No valid Manual or Auto price found" })
        continue
      }

      summary.ready++
      outReady.push({
        make: makeName,
        model: modelName,
        year_from: 1980,
        year_to: 2027,
        service: serviceName,
        labor_manual: laborM,
        labor_automatic: laborAT
      })
    }
  }

  console.log(`Ready to Import: ${summary.ready}`)
  fs.writeFileSync('/Users/triciaportillo/.gemini/antigravity/brain/618526df-59ad-4e75-aaa9-46e4f0cac3af/scratch/dry_run_ready.json', JSON.stringify(outReady, null, 2))
}

dryRun()
