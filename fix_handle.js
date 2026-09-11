const fs = require('fs')

function fixHandle(file) {
  let code = fs.readFileSync(file, 'utf8')
  
  const newHandle = `const handleCategorySelect = (cat: any) => {
    if (!cat) {
      setCategoryName('');
      setEngineOilClassification(null);
      return;
    }
    setCategoryName(cat.name);
    if (cat.name.toUpperCase() === 'ENGINE OIL') {
      setShowOilModal(true);
    } else {
      setEngineOilClassification(null);
    }
  }`
  
  code = code.replace(/const handleCategorySelect = \(cat: any\) => \{\n\s*if \(\!cat\) return;\n\s*setCategoryName\(cat\.name\);\n\s*if \(cat\.name\.toUpperCase\(\) === 'ENGINE OIL'\) \{\n\s*setShowOilModal\(true\);\n\s*\} else \{\n\s*setEngineOilClassification\(null\);\n\s*\}\n\s*\}/, newHandle)
  
  fs.writeFileSync(file, code)
}

fixHandle('src/app/(dashboard)/parts/new/page.tsx')
fixHandle('src/components/parts/AddPartModal.tsx')
fixHandle('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx')
console.log('Fixed handleCategorySelect')
