const fs = require('fs')
const path = 'src/components/parts/AddPartModal.tsx'
let code = fs.readFileSync(path, 'utf8')

code = code.replace(
  /<\/div>\n    <\/div>\n  \)\n\}/,
  `      <EngineOilClassificationModal\n        isOpen={showOilModal}\n        onClose={() => setShowOilModal(false)}\n        onSelect={setEngineOilClassification}\n        currentValue={engineOilClassification}\n      />\n    </div>\n    </div>\n  )\n}`
)

fs.writeFileSync(path, code)
console.log('Patched AddPartModal.tsx')
