const fs = require('fs')

let file = 'src/app/(dashboard)/admin/service-intervals/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldHandleSave = /setSaving\(true\)\n\s*for \(const item of intervals\) \{[\s\S]*?await fetchIntervals\(\)\n\s*setSaving\(false\)\n\s*alert\("Saved successfully\."\)/;

const newHandleSave = `setSaving(true)
    let hasError = false
    let errorMessage = ""
    
    for (const item of intervals) {
      if (item.id && !item.isNew) {
        const { error } = await supabase.from('service_intervals').update({
          service_type: item.service_type,
          classification: item.classification,
          months: item.months,
          kilometers: item.kilometers
        }).eq('id', item.id)
        if (error) {
          hasError = true
          errorMessage = error.message
          break
        }
      } else {
        const { error } = await supabase.from('service_intervals').insert([{
          service_type: item.service_type,
          classification: item.classification,
          months: item.months,
          kilometers: item.kilometers
        }])
        if (error) {
          hasError = true
          errorMessage = error.message
          break
        }
      }
    }
    
    await fetchIntervals()
    setSaving(false)
    
    if (hasError) {
      alert("Failed to save: " + errorMessage)
    } else {
      alert("Saved successfully.")
    }`

if (code.match(oldHandleSave)) {
  code = code.replace(oldHandleSave, newHandleSave)
  fs.writeFileSync(file, code)
  console.log("Patched service-intervals page.tsx for error handling")
} else {
  console.log("Could not find handleSave logic to replace")
}
