const fs = require('fs')
const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  code = code.replace(/<button type="button" onClick=\{handleSaveVehicleChanges\} className="bg-blue-600 hover:bg-blue-700/g, '<button type="button" disabled={isSavingVehicle} onClick={handleSaveVehicleChanges} className="disabled:bg-blue-400 bg-blue-600 hover:bg-blue-700')
  fs.writeFileSync(file, code)
})
console.log("Patched buttons")
