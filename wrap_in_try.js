const fs = require('fs')

function wrapTryFinally(filePath) {
  let code = fs.readFileSync(filePath, 'utf8')
  
  // Find handleSaveVehicleChanges
  const regex = /const handleSaveVehicleChanges = async \(\) => \{\n\s*if \(isSavingVehicle\) return;\n\s*setIsSavingVehicle\(true\);([\s\S]*?)\n\s*\}\n\n\s*\/\/ Clear/
  
  const match = code.match(regex)
  if (match) {
    const body = match[1]
    const newBody = `\n    try {${body}\n    } finally {\n      setIsSavingVehicle(false);\n    }`
    code = code.replace(match[0], `const handleSaveVehicleChanges = async () => {\n    if (isSavingVehicle) return;\n    setIsSavingVehicle(true);${newBody}\n  }\n\n  // Clear`)
    fs.writeFileSync(filePath, code)
    console.log("Wrapped", filePath)
  } else {
    // For QuickSaleForm it might not have "// Clear"
    const regexQS = /const handleSaveVehicleChanges = async \(\) => \{\n\s*if \(isSavingVehicle\) return;\n\s*setIsSavingVehicle\(true\);\n\s*try \{([\s\S]*?)\n\s*\}\n\n\s*const handleClearCustomer/
    const matchQS = code.match(regexQS)
    if (matchQS) {
      // Just add finally to the existing try
      const newFn = matchQS[0].replace(/catch \(err: any\) \{\n\s*alert\(err.message\)\n\s*\}/, `catch (err: any) {\n      alert(err.message)\n    } finally {\n      setIsSavingVehicle(false);\n    }`)
      code = code.replace(matchQS[0], newFn)
      fs.writeFileSync(filePath, code)
      console.log("Wrapped QS", filePath)
    }
  }
}

wrapTryFinally('src/components/quotations/QuotationForm.tsx')
wrapTryFinally('src/components/estimates/EstimateForm.tsx')
wrapTryFinally('src/components/quick-sale/QuickSaleForm.tsx')

