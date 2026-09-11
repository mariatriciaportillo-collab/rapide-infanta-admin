const fs = require('fs')

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8')
  if (!code.includes('<EngineOilClassificationModal')) {
    code = code.replace(
      /<\/form>/,
      `</form>\n\n      <EngineOilClassificationModal\n        isOpen={showOilModal}\n        onClose={() => setShowOilModal(false)}\n        onSelect={setEngineOilClassification}\n        currentValue={engineOilClassification}\n      />`
    )
    fs.writeFileSync(file, code)
    console.log('Patched modal tail for ' + file)
  }
}

patchFile('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx')
patchFile('src/components/parts/AddPartModal.tsx')
