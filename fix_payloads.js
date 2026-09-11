const fs = require('fs')

function fixPayload(file) {
  let code = fs.readFileSync(file, 'utf8')
  if (!code.includes('engine_oil_classification')) {
    console.log("No engine_oil_classification found in", file)
    return;
  }
  
  if (code.includes('engine_oil_classification: categoryName.toUpperCase()')) {
    console.log("Already has classification in payload:", file)
    return;
  }

  code = code.replace(
    /category_id:\s*(selectedCategoryId|categoryId),/,
    match => match + "\n      engine_oil_classification: categoryName.toUpperCase() === 'ENGINE OIL' ? engineOilClassification : null,"
  )
  fs.writeFileSync(file, code)
  console.log("Fixed payload in", file)
}

fixPayload('src/app/(dashboard)/parts/new/page.tsx')
fixPayload('src/components/parts/AddPartModal.tsx')
