const fs = require('fs')

let file = 'src/app/(dashboard)/admin/service-intervals/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldRemove = /const handleRemove = async \(index: number\) => \{\n\s*const item = intervals\[index\]\n\s*if \(\!item\.isNew && item\.id\) \{\n\s*await supabase\.from\('service_intervals'\)\.delete\(\)\.eq\('id', item\.id\)\n\s*\}\n\s*setIntervals\(intervals\.filter\(\(_, i\) => i !== index\)\)\n\s*\}/

const newRemove = `const handleRemove = async (index: number) => {
    const item = intervals[index]
    if (!item.isNew && item.id) {
      const { error } = await supabase.from('service_intervals').delete().eq('id', item.id)
      if (error) {
        alert("Failed to delete: " + error.message)
        return
      }
    }
    setIntervals(intervals.filter((_, i) => i !== index))
  }`

if (code.match(oldRemove)) {
  code = code.replace(oldRemove, newRemove)
  fs.writeFileSync(file, code)
  console.log("Patched handleRemove")
} else {
  console.log("Could not find handleRemove")
}
