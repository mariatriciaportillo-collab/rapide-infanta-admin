const fs = require('fs')

let file = 'src/app/(dashboard)/labor-charges/[id]/edit/EditLaborChargeClient.tsx'
let code = fs.readFileSync(file, 'utf8')

if (!code.includes('checkDuplicateLabor')) {
  code = code.replace(
    /import \{ createClient \} from '@\/utils\/supabase\/client'/,
    "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicateLabor } from '@/utils/duplicateCheck'"
  )
}

const newLogic = `
    const isDuplicate = await checkDuplicateLabor(supabase, {
      name: serviceName.trim(),
      category_id: selectedCategoryId,
      exclude_id: id
    })

    if (isDuplicate) {
      setError("This Labor Charge already exists. Please use or edit the existing record instead.")
      setIsSubmitting(false)
      return
    }

    const { error: updateError } = await supabase.from('labor_services').update({`

if (code.match(/const \{ error: updateError \} = await supabase\.from\('labor_services'\)\.update\(\{/)) {
  code = code.replace(/const \{ error: updateError \} = await supabase\.from\('labor_services'\)\.update\(\{/, newLogic)
}

const oldLogic = /if \(updateError\) \{\n\s*if \(updateError\.code === '23505'\) \{\n\s*setError\("A service with this name already exists\."\)/;
code = code.replace(oldLogic, `if (updateError) {\n      if (updateError.code === '23505') {\n        setError("This Labor Charge already exists. Please use or edit the existing record instead.")`)

fs.writeFileSync(file, code)
console.log("Patched EditLaborChargeClient.tsx")
