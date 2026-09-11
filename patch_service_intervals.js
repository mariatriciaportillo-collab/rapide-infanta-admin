const fs = require('fs')

let file = 'src/app/(dashboard)/admin/service-intervals/page.tsx'
let code = fs.readFileSync(file, 'utf8')

// Add import
if (!code.includes('ENGINE_OIL_CLASSIFICATIONS')) {
  code = code.replace(
    /import \{ Save, Plus, Trash2, Edit2 \} from 'lucide-react'/,
    "import { Save, Plus, Trash2, Edit2 } from 'lucide-react'\nimport { ENGINE_OIL_CLASSIFICATIONS } from '@/components/parts/EngineOilClassificationModal'"
  )
}

// Add duplicate validation logic inside handleSave
const oldHandleSave = /const handleSave = async \(\) => \{\n\s*setSaving\(true\)/
const newHandleSave = `const handleSave = async () => {
    const combinations = new Set();
    for (const item of intervals) {
      const type = (item.service_type || '').trim().toUpperCase();
      const cls = (item.classification || '').trim().toUpperCase();
      const key = \`\${type}::\${cls}\`;
      if (combinations.has(key)) {
        alert(\`Duplicate rule found for: \${item.service_type} - \${item.classification || 'Default'}. Please remove the duplicate before saving.\`);
        return;
      }
      combinations.add(key);
      
      const isOilChange = type.includes('OIL CHANGE') || type.includes('ENGINE OIL');
      if (isOilChange && !item.classification) {
        alert(\`Please select an Oil Classification for the rule: \${item.service_type}\`);
        return;
      }
    }
    setSaving(true)`

if (code.match(oldHandleSave)) {
  code = code.replace(oldHandleSave, newHandleSave)
}

// Replace the classification input render
const oldInput = /<td className="py-3 pr-4">\s*<input type="text" value=\{item\.classification\} onChange=\{e => handleUpdate\(idx, 'classification', e\.target\.value\)\} className="w-full border border-slate-300 rounded p-2 text-sm" \/>\s*<\/td>/;
const newInput = `<td className="py-3 pr-4">
                      {(() => {
                        const isOilChange = item.service_type?.toUpperCase().includes('OIL CHANGE') || item.service_type?.toUpperCase().includes('ENGINE OIL');
                        if (isOilChange) {
                          return (
                            <select 
                              value={item.classification || ''} 
                              onChange={e => handleUpdate(idx, 'classification', e.target.value)} 
                              className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                            >
                              <option value="">Select Oil Type...</option>
                              {ENGINE_OIL_CLASSIFICATIONS.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                              ))}
                            </select>
                          )
                        } else {
                          return (
                            <input 
                              type="text" 
                              value={item.classification || ''} 
                              onChange={e => handleUpdate(idx, 'classification', e.target.value)} 
                              className="w-full border border-slate-300 rounded p-2 text-sm text-slate-400 bg-slate-50 cursor-not-allowed" 
                              placeholder="N/A"
                              disabled
                            />
                          )
                        }
                      })()}
                    </td>`

if (code.match(oldInput)) {
  code = code.replace(oldInput, newInput)
}

fs.writeFileSync(file, code)
console.log("Patched service-intervals page.tsx")
