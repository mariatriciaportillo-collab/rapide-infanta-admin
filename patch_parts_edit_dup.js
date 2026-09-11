const fs = require('fs')

let file = 'src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx'
let code = fs.readFileSync(file, 'utf8')

// Add import
if (!code.includes('checkDuplicatePart')) {
  code = code.replace(
    /import \{ createClient \} from '@\/utils\/supabase\/client'/,
    "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicatePart } from '@/utils/duplicateCheck'"
  )
}

const oldLogic = /\/\/ Duplicate part number check[\s\S]*?(?=const payload = \{)/;

const newLogic = `
    const isDuplicate = await checkDuplicatePart(supabase, {
      name: name.trim(),
      part_number: partNumber.trim() || null,
      brand_id: selectedBrandId || null,
      category_id: selectedCategoryId,
      engine_oil_classification: categoryName.toUpperCase() === 'ENGINE OIL' ? engineOilClassification : null,
      exclude_id: id
    })

    if (isDuplicate) {
      setError("This Part / Material already exists. Please use or edit the existing record instead.")
      setIsSubmitting(false)
      return
    }

    `

if (code.match(oldLogic)) {
  code = code.replace(oldLogic, newLogic)
} else {
  // Wait, does EditPartClient have a duplicate check already?
  if (code.includes('const payload = {')) {
    code = code.replace('const payload = {', newLogic + 'const payload = {')
  } else {
    console.log("Could not find payload start in EditPartClient")
  }
}

fs.writeFileSync(file, code)
console.log("Patched EditPartClient.tsx")
