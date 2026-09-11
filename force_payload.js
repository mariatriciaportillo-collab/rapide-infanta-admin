const fs = require('fs')

function patchPayload(file, categoryVar) {
  let code = fs.readFileSync(file, 'utf8')
  if (code.includes('engine_oil_classification:')) {
    console.log("Already patched", file)
    return
  }
  
  const regex = new RegExp("category_id:\\s*" + categoryVar + ",?")
  code = code.replace(
    regex,
    "category_id: " + categoryVar + ",\n      engine_oil_classification: categoryName.toUpperCase() === 'ENGINE OIL' ? engineOilClassification : null,"
  )
  
  fs.writeFileSync(file, code)
  console.log("Forced payload on", file)
}

patchPayload('src/app/(dashboard)/parts/new/page.tsx', 'selectedCategoryId')
patchPayload('src/components/parts/AddPartModal.tsx', 'categoryId')
