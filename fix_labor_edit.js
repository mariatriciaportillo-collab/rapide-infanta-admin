const fs = require('fs')

let file = 'src/app/(dashboard)/labor-charges/[id]/edit/EditLaborChargeClient.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldLogic = /const \{ error: updateError \} = await supabase\s*\.from\('labor_services'\)\s*\.update\(\{/

const newLogic = `
    const isDuplicate = await checkDuplicateLabor(supabase, {
      name: serviceName.trim(),
      category_id: selectedCategoryId,
      exclude_id: service.id
    })

    if (isDuplicate) {
      setError("This Labor Charge already exists. Please use or edit the existing record instead.")
      setIsSubmitting(false)
      return
    }

    const { error: updateError } = await supabase
      .from('labor_services')
      .update({`

if (code.match(oldLogic)) {
  code = code.replace(oldLogic, newLogic)
}

fs.writeFileSync(file, code)
console.log("Fixed EditLaborChargeClient.tsx")
