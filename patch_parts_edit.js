const fs = require('fs')
const path = 'src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx'
let code = fs.readFileSync(path, 'utf8')

if (!code.includes('EngineOilClassificationModal')) {
  // Imports
  code = code.replace(
    /import \{ PartGroupCategorySelector \} from '@\/components\/parts\/PartGroupCategorySelector'/,
    "import { PartGroupCategorySelector } from '@/components/parts/PartGroupCategorySelector'\nimport { EngineOilClassificationModal } from '@/components/parts/EngineOilClassificationModal'"
  )

  // State
  code = code.replace(
    /const \[selectedCategoryId, setSelectedCategoryId\] = useState\(''\)/,
    "const [selectedCategoryId, setSelectedCategoryId] = useState('')\n  const [categoryName, setCategoryName] = useState('')\n  const [engineOilClassification, setEngineOilClassification] = useState<string | null>(null)\n  const [showOilModal, setShowOilModal] = useState(false)"
  )

  // onCategorySelect
  const handleCatSelect = `
  const handleCategorySelect = (cat: any) => {
    if (!cat) return;
    setCategoryName(cat.name);
    if (cat.name.toUpperCase() === 'ENGINE OIL') {
      setShowOilModal(true);
    } else {
      setEngineOilClassification(null);
    }
  }
  `
  code = code.replace(/const handleSubmit = async/, handleCatSelect + '\n  const handleSubmit = async')

  // Fetch logic
  code = code.replace(
    /\.select\('\*'\)/,
    ".select('*, part_categories(name)')"
  )
  
  code = code.replace(
    /setIsActive\(data\.is_active \!== false\)/,
    "setIsActive(data.is_active !== false)\n    setEngineOilClassification(data.engine_oil_classification || null)\n    if (data.part_categories?.name) setCategoryName(data.part_categories.name)"
  )

  // Insert payload
  code = code.replace(
    /category_id: selectedCategoryId \|\| null,/,
    "category_id: selectedCategoryId || null,\n        engine_oil_classification: categoryName.toUpperCase() === 'ENGINE OIL' ? engineOilClassification : null,"
  )

  // UI indicator
  const uiIndicator = `
                    <PartGroupCategorySelector 
                      selectedGroupId={selectedGroupId}
                      setSelectedGroupId={setSelectedGroupId}
                      selectedCategoryId={selectedCategoryId}
                      setSelectedCategoryId={setSelectedCategoryId}
                      onCategorySelect={handleCategorySelect}
                    />
                    {categoryName.toUpperCase() === 'ENGINE OIL' && (
                      <div className="mt-3 p-3 bg-slate-50 border rounded-md flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Oil Classification</span>
                          <span className="text-sm text-slate-800 font-medium">{engineOilClassification || 'Not Selected'}</span>
                        </div>
                        <button type="button" onClick={() => setShowOilModal(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Change
                        </button>
                      </div>
                    )}
  `
  code = code.replace(
    /<PartGroupCategorySelector[\s\S]*?\/>/,
    uiIndicator.trim()
  )

  // Add the modal before closing main div
  code = code.replace(
    /<\/div>\n\s*<\/div>\n\s*\)$/,
    `      <EngineOilClassificationModal\n        isOpen={showOilModal}\n        onClose={() => setShowOilModal(false)}\n        onSelect={setEngineOilClassification}\n        currentValue={engineOilClassification}\n      />\n    </div>\n  </div>\n  )\n`
  )

  fs.writeFileSync(path, code)
  console.log('Patched EditPartClient.tsx')
} else {
  console.log('Already patched EditPartClient.tsx')
}
