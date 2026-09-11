const fs = require('fs')

let file = 'src/app/(dashboard)/parts/new/page.tsx'
let code = fs.readFileSync(file, 'utf8')

// Add import
if (!code.includes('checkDuplicatePart')) {
  code = code.replace(
    /import \{ createClient \} from '@\/utils\/supabase\/client'/,
    "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicatePart } from '@/utils/duplicateCheck'"
  )
}

// Remove old logic and add new logic
const oldLogic = /\/\/ Duplicate part number check[\s\S]*?(?=const payload = \{)/;

const newLogic = `
    const isDuplicate = await checkDuplicatePart(supabase, {
      name: name.trim(),
      part_number: partNumber.trim() || null,
      brand_id: selectedBrandId || null,
      category_id: selectedCategoryId,
      engine_oil_classification: categoryName.toUpperCase() === 'ENGINE OIL' ? engineOilClassification : null
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
  // Try to find the exact place before payload if it doesn't match the comment
  const payloadStart = "const payload = {"
  code = code.replace(payloadStart, newLogic + payloadStart)
}

fs.writeFileSync(file, code)
console.log("Patched parts/new/page.tsx")
