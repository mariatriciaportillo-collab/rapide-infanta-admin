const fs = require('fs')
const path = 'src/components/parts/PartGroupCategorySelector.tsx'
let code = fs.readFileSync(path, 'utf8')

if (!code.includes('onCategorySelect')) {
  code = code.replace(
    /setSelectedCategoryId: \(val: string\) => void\n\s*disabled\?: boolean/,
    "setSelectedCategoryId: (val: string) => void\n  disabled?: boolean\n  onCategorySelect?: (category: PartCategory | null) => void"
  )
  code = code.replace(
    /setSelectedCategoryId, \n\s*disabled \n}: Props\)/,
    "setSelectedCategoryId, \n  disabled, \n  onCategorySelect \n}: Props)"
  )

  // Where it sets category:
  // setSelectedCategoryId(cat.id)
  // setCategorySearch('')
  // setIsCategoryOpen(false)
  code = code.replace(
    /setSelectedCategoryId\(cat\.id\)\n\s*setCategorySearch\(''\)\n\s*setIsCategoryOpen\(false\)/g,
    "setSelectedCategoryId(cat.id)\n                    onCategorySelect?.(cat)\n                    setCategorySearch('')\n                    setIsCategoryOpen(false)"
  )
  fs.writeFileSync(path, code)
  console.log('Patched PartGroupCategorySelector')
} else {
  console.log('Already patched')
}
