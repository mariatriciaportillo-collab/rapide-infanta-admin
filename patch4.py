import re

def patch_new_html():
    with open('src/app/(dashboard)/parts/new/page.tsx', 'r') as f:
        code = f.read()

    html = """<div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Part / Product Name *</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  if (!hasEditedDisplayName) setDisplayName(e.target.value)
                }}
                className="w-full border border-slate-300 rounded-md p-2 font-medium" 
                placeholder="e.g. Toyota Engine Oil 5W-30 (Internal)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
              <input 
                required 
                type="text" 
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value)
                  setHasEditedDisplayName(true)
                }}
                className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" 
                placeholder="e.g. Engine Oil 5W-30"
              />
              <p className="text-xs text-slate-500 mt-1">This is the cleaner name shown on quotations, invoices, and printed documents to the customer.</p>
            </div>"""

    code = re.sub(r'<div className="md:col-span-2">\s*<label className="block text-sm font-medium text-slate-700 mb-1">Part / Product Name \*\s*</label>\s*<input \s*required \s*type="text" \s*value=\{name\}\s*onChange=\{e => setName\(e.target.value\)\}\s*className="w-full border border-slate-300 rounded-md p-2 font-medium"\s*placeholder="e.g. Toyota Engine Oil 5W-30"\s*/>\s*</div>', html, code, flags=re.MULTILINE)

    with open('src/app/(dashboard)/parts/new/page.tsx', 'w') as f:
        f.write(code)

patch_new_html()
