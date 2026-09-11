const fs = require('fs')

const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  
  // Remove Engine Capacity input blocks
  code = code.replace(/<div>\s*<label[^>]*>Engine Capacity[^<]*<\/label>\s*<input[^>]*value=\{engineCapacity\}[^>]*>\s*<\/div>/g, '')
  // Remove VIN input blocks
  code = code.replace(/<div>\s*<label[^>]*>VIN \/ Chassis No[^<]*<\/label>\s*<input[^>]*value=\{vin\}[^>]*>\s*<\/div>/g, '')

  fs.writeFileSync(file, code)
  console.log("Patched UI in", file)
})
