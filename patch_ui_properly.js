const fs = require('fs')

const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  
  // Regex to remove the Engine Capacity div
  code = code.replace(/<div className="col-span-1">\s*<label[^>]*>Engine Capacity<\/label>\s*<input[^>]*value=\{engineCapacity\}[^>]*>\s*<\/div>/g, '')
  
  // Regex to remove the VIN div
  code = code.replace(/<div className="col-span-1">\s*<label[^>]*>VIN \/ Chassis No\.?<\/label>\s*<input[^>]*value=\{vin\}[^>]*>\s*<\/div>/g, '')

  fs.writeFileSync(file, code)
  console.log("Patched UI in", file)
})
