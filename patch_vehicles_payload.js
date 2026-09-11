const fs = require('fs')

const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  
  // Remove vin and engine_capacity from payloads
  code = code.replace(/vin:\s*vin[^\n]*,?\n/g, '')
  code = code.replace(/engine_capacity:\s*engineCapacity[^\n]*,?\n/g, '')

  fs.writeFileSync(file, code)
  console.log("Patched", file)
})
