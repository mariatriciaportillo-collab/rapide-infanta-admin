const fs = require('fs')

const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  
  // 1. Add state variable
  if (!code.includes('isSavingVehicle')) {
    code = code.replace(/const \[isSavingCustomer, setIsSavingCustomer\] = useState\(false\)/, 'const [isSavingCustomer, setIsSavingCustomer] = useState(false)\n  const [isSavingVehicle, setIsSavingVehicle] = useState(false)')
  }
  
  // 2. Add to handleSaveVehicleChanges
  code = code.replace(/const handleSaveVehicleChanges = async \(\) => {/g, 'const handleSaveVehicleChanges = async () => {\n    if (isSavingVehicle) return;\n    setIsSavingVehicle(true);')
  
  // Make sure to reset it on error or success
  // A simple way is to replace `return` inside the function with `setIsSavingVehicle(false); return`
  // And add `setIsSavingVehicle(false);` at the end of the function.
  
  // Let's just do a manual replacement using AST or careful string matching because it's complex.
  fs.writeFileSync(file, code)
})
