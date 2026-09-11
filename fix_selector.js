const fs = require('fs')
const path = 'src/components/parts/PartGroupCategorySelector.tsx'
let code = fs.readFileSync(path, 'utf8')

code = code.replace(
  /const handleSelectCategory = \(categoryId: string\) => \{\n\s*setSelectedCategoryId\(categoryId\)\n\s*setCategorySearch\(''\)\n\s*setIsCategoryOpen\(false\)\n\s*\}/,
  `const handleSelectCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId)
    setSelectedCategoryId(categoryId)
    if (onCategorySelect) onCategorySelect(cat || null)
    setCategorySearch('')
    setIsCategoryOpen(false)
  }`
)

// We also need to clear the categoryName when the group changes!
code = code.replace(
  /setSelectedCategoryId\(''\) \/\/ Reset category when group changes/,
  `setSelectedCategoryId('') // Reset category when group changes\n    if (onCategorySelect) onCategorySelect(null)`
)

fs.writeFileSync(path, code)
console.log('Fixed PartGroupCategorySelector')
