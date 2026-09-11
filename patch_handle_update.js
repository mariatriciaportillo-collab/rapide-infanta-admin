const fs = require('fs')

let file = 'src/app/(dashboard)/admin/service-intervals/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldHandle = /const handleUpdate = \(index: number, field: string, value: string\) => \{\n\s*const updated = \[\.\.\.intervals\]\n\s*if \(field === 'months' \|\| field === 'kilometers'\) \{\n\s*updated\[index\]\[field\] = value \? parseInt\(value\) : 0\n\s*\} else \{\n\s*updated\[index\]\[field\] = value\n\s*\}\n\s*setIntervals\(updated\)\n\s*\}/

const newHandle = `const handleUpdate = (index: number, field: string, value: string) => {
    const updated = [...intervals]
    if (field === 'months' || field === 'kilometers') {
      updated[index][field] = value ? parseInt(value) : 0
    } else {
      updated[index][field] = value
    }
    
    if (field === 'service_type') {
      const isOilChange = value?.toUpperCase().includes('OIL CHANGE') || value?.toUpperCase().includes('ENGINE OIL');
      if (!isOilChange) {
        updated[index]['classification'] = null;
      }
    }
    
    setIntervals(updated)
  }`

if (code.match(oldHandle)) {
  code = code.replace(oldHandle, newHandle)
  fs.writeFileSync(file, code)
  console.log("Patched handleUpdate")
} else {
  console.log("Could not find handleUpdate")
}
