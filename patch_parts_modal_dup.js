const fs = require('fs')

let file = 'src/components/parts/AddPartModal.tsx'
let code = fs.readFileSync(file, 'utf8')

// Add import
if (!code.includes('checkDuplicatePart')) {
  code = code.replace(
    /import \{ createClient \} from '@\/utils\/supabase\/client'/,
    "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicatePart } from '@/utils/duplicateCheck'"
  )
}

const oldLogic = /if \(partNumber\.trim\(\)\) \{[\s\S]*?(?=const payload = \{)/;

const newLogic = `
    const isDuplicate = await checkDuplicatePart(supabase, {
      name: name.trim(),
      part_number: partNumber.trim() || null,
      brand_id: brandId || null,
      category_id: categoryId,
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
  const payloadStart = "const payload = {"
  code = code.replace(payloadStart, newLogic + payloadStart)
}

fs.writeFileSync(file, code)
console.log("Patched AddPartModal.tsx")
