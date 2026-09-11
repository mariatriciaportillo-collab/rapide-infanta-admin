const fs = require('fs')

let file = 'src/app/(dashboard)/labor-charges/new/page.tsx'
let code = fs.readFileSync(file, 'utf8')

if (!code.includes('checkDuplicateLabor')) {
  code = code.replace(
    /import \{ createClient \} from '@\/utils\/supabase\/client'/,
    "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicateLabor } from '@/utils/duplicateCheck'"
  )
}

const oldLogic = /if \(insertError\) \{\n\s*if \(insertError\.code === '23505'\) \{\n\s*setError\("A service with this name already exists\."\)/;

const newLogic = `
    const isDuplicate = await checkDuplicateLabor(supabase, {
      name: serviceName.trim(),
      category_id: selectedCategoryId
    })

    if (isDuplicate) {
      setError("This Labor Charge already exists. Please use or edit the existing record instead.")
      setIsSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('labor_services').insert({`

if (code.match(/const \{ error: insertError \} = await supabase\.from\('labor_services'\)\.insert\(\{/)) {
  code = code.replace(/const \{ error: insertError \} = await supabase\.from\('labor_services'\)\.insert\(\{/, newLogic)
}

// Remove the old unique constraint error handler if we want, or just leave it
code = code.replace(oldLogic, `if (insertError) {\n      if (insertError.code === '23505') {\n        setError("This Labor Charge already exists. Please use or edit the existing record instead.")`)

fs.writeFileSync(file, code)
console.log("Patched labor-charges/new/page.tsx")
