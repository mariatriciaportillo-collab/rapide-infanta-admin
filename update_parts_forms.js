const fs = require('fs');
['src/app/(dashboard)/parts/new/page.tsx', 'src/app/(dashboard)/parts/[id]/edit/page.tsx'].forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Add autoSuggestLabor state if not present
    if (!content.includes('autoSuggestLabor')) {
      content = content.replace(
        /const \[isActive, setIsActive\] = useState\(.*?true.*?\)/,
        `const [isActive, setIsActive] = useState(true)\n  const [autoSuggestLabor, setAutoSuggestLabor] = useState(false)`
      );
      content = content.replace(
        /const \[isActive, setIsActive\] = useState\(part\.is_active\)/,
        `const [isActive, setIsActive] = useState(part.is_active)\n  const [autoSuggestLabor, setAutoSuggestLabor] = useState(part.auto_suggest_labor || false)`
      );
      
      // Update INSERT / UPDATE queries
      content = content.replace(
        /is_active: isActive,?\s*\}/,
        `is_active: isActive,\n        auto_suggest_labor: autoSuggestLabor\n      }`
      );
      
      // Update prompt handling for redirect in NEW part creation ONLY
      if (path.includes('/new/page.tsx')) {
        content = content.replace(
          /router\.push\('\/parts'\)/,
          `if (autoSuggestLabor) {
          if (confirm('Part saved successfully! Set up a Labor Rule for this Part now?')) {
            router.push(\`/part-labor-rules/new?part_id=\${data.id}\`)
            return
          }
        }
        router.push('/parts')`
        );
      }
      
      // Add the UI section
      const autoSuggestUI = `
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">AUTOMATION</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-800">Auto-Suggest Labor?</label>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">If Yes, selecting this part in a Quotation/Estimate can automatically suggest related repair labor (configured in Part-to-Labor Rules).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoSuggestLabor}
                  onChange={(e) => setAutoSuggestLabor(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        `;
        
      content = content.replace(
        /<div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-8">/,
        `${autoSuggestUI}\n        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-8">`
      );
      
      fs.writeFileSync(path, content);
    }
  }
});
