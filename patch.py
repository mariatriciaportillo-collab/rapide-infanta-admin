import re

def patch_edit():
    with open('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx', 'r') as f:
        code = f.read()

    code = code.replace("const [name, setName] = useState('')", "const [name, setName] = useState('')\n  const [displayName, setDisplayName] = useState('')\n  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)")

    code = code.replace("setName(data.name || '')", "setName(data.name || '')\n        setDisplayName(data.display_name || data.name || '')\n        setHasEditedDisplayName(!!data.display_name)")

    code = code.replace("const payload = {", "const payload = {\n      display_name: displayName.trim(),")

    html = """<div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material Name *</label>
                <input required type="text" value={name} onChange={e => {
                  setName(e.target.value)
                  if (!hasEditedDisplayName) setDisplayName(e.target.value)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                <input required type="text" value={displayName} onChange={e => {
                  setDisplayName(e.target.value)
                  setHasEditedDisplayName(true)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" />
                <p className="text-xs text-slate-500 mt-1">Shown on quotations, invoices, and printables.</p>
              </div>"""

    code = re.sub(r'<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Part / Material Name \*\s*</label>\s*<input required type="text" value=\{name\} onChange=\{e => setName\(e.target.value\)\} className="w-full border border-slate-300 rounded-md p-2 font-medium" />\s*</div>', html, code, flags=re.MULTILINE)

    with open('src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx', 'w') as f:
        f.write(code)

def patch_new():
    with open('src/app/(dashboard)/parts/new/page.tsx', 'r') as f:
        code = f.read()

    code = code.replace("const [name, setName] = useState('')", "const [name, setName] = useState('')\n  const [displayName, setDisplayName] = useState('')\n  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)")

    code = code.replace("const payload = {", "const payload = {\n      display_name: displayName.trim(),")

    html = """<div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material Name *</label>
                <input required type="text" value={name} onChange={e => {
                  setName(e.target.value)
                  if (!hasEditedDisplayName) setDisplayName(e.target.value)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="e.g. Toyota Engine Oil 5W-30" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                <input required type="text" value={displayName} onChange={e => {
                  setDisplayName(e.target.value)
                  setHasEditedDisplayName(true)
                }} className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" placeholder="e.g. Engine Oil 5W-30" />
                <p className="text-xs text-slate-500 mt-1">Shown on quotations, invoices, and printables.</p>
              </div>"""

    code = re.sub(r'<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Part / Material Name \*\s*</label>\s*<input required type="text" value=\{name\} onChange=\{e => setName\(e.target.value\)\} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="e.g. Toyota Engine Oil 5W-30" />\s*</div>', html, code, flags=re.MULTILINE)

    with open('src/app/(dashboard)/parts/new/page.tsx', 'w') as f:
        f.write(code)

patch_edit()
patch_new()
