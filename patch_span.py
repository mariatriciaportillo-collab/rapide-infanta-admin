import re

def patch():
    with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
        code = f.read()

    old_span = """              <span className={`truncate text-sm ${selectedPart ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                {selectedPart ? `${selectedPart.name} ${selectedPart.part_number ? `(${selectedPart.part_number})` : ''}` : 'Search part by name, SKU, or brand...'}
              </span>"""
    
    new_span = """              <div className={`truncate text-sm ${selectedPart ? 'w-full' : 'text-slate-500'}`}>
                {selectedPart ? (
                  <div className="flex flex-col leading-tight">
                    <span className="text-slate-900 font-medium truncate">{selectedPart.name}</span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {[selectedPart.part_number, selectedPart.brands?.name, `Stock: ${selectedPart.stock_quantity}`].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                ) : (
                  'Search part by name, SKU, or brand...'
                )}
              </div>"""

    code = code.replace(old_span, new_span)

    with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
        f.write(code)

patch()
