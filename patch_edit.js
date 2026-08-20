const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx', 'utf8');

code = code.replace("const [name, setName] = useState('')", "const [name, setName] = useState('')\n  const [displayName, setDisplayName] = useState('')\n  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)");

code = code.replace("setName(data.name || '')", "setName(data.name || '')\n        setDisplayName(data.display_name || data.name || '')\n        setHasEditedDisplayName(!!data.display_name)");

code = code.replace("const payload = {", "const payload = {\n      display_name: displayName.trim(),");

let htmlReplacement = `<div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material Name *</label>
                <input required type="text" value={name} onChange={e => {
                  setName(e.target.value)
                  if (!hasEditedDisplayName) setDisplayName(e.target.value)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                <input required type="text" value={displayName} onChange={e => {
                  setDisplayName(e.target.value)
                  setHasEditedDisplayName(true)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" />
                <p className="text-xs text-slate-500 mt-1">Shown on quotations, invoices, and printables.</p>
              </div>`;

code = code.replace(/<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Part \/ Material Name \*/[\s\S]*?<\/div>/m, htmlReplacement);

fs.writeFileSync('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx', code);
