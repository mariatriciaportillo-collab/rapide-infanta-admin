import re

def patch():
    with open('src/app/(dashboard)/stock-adjustments/new/page.tsx', 'r') as f:
        code = f.read()

    # Fix UUID hydration issue
    code = code.replace(
        "    { id: crypto.randomUUID(), partId: '', part: null, adjType: 'Increase Stock', qty: '' }",
        "    { id: 'initial-row-1', partId: '', part: null, adjType: 'Increase Stock', qty: '' }"
    )

    # Fix handleAddItem to use functional update
    old_add = """  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), partId: '', part: null, adjType: 'Increase Stock', qty: '' }])
  }"""
    new_add = """  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, adjType: 'Increase Stock', qty: '' }])
  }"""
    code = code.replace(old_add, new_add)
    
    # Fix handleRemoveItem to use functional update
    old_remove = """  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }"""
    new_remove = """  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }"""
    code = code.replace(old_remove, new_remove)

    # Fix handleUpdateItem React state batching bug
    old_update = """  const handleUpdateItem = (id: string, field: keyof AdjItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }"""
    new_update = """  const handleUpdateItem = (id: string, field: keyof AdjItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }"""
    code = code.replace(old_update, new_update)

    # Fix Save Adjustment button disabled logic
    code = code.replace(
        'disabled={isSubmitting || items.some(i => !i.partId)}',
        'disabled={isSubmitting}'
    )

    # Fix the Result display from just "final number" to "current -> new"
    old_result_html = """                        <div className={`font-bold text-lg ${isError ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.part ? `${newStock}` : '—'}
                        </div>"""
    new_result_html = """                        <div className={`font-bold text-lg ${isError ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.part ? (
                            <span className="flex items-center justify-end gap-2">
                              <span className="text-slate-400 text-sm">{currentStock}</span>
                              <span className="text-slate-300 text-xs">→</span>
                              <span>{newStock}</span>
                            </span>
                          ) : '—'}
                        </div>"""
    code = code.replace(old_result_html, new_result_html)
    
    # Add inline validation error
    old_div_close = """                      </div>
                    </div>
                  </div>
                )"""
    new_div_close = """                      </div>
                    </div>
                    {isError && (
                      <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded flex items-center gap-2">
                        <AlertCircle size={14} />
                        Cannot deduct more than the available stock of {currentStock} {item.part?.unit || 'pcs'}.
                      </div>
                    )}
                  </div>
                )"""
    code = code.replace(old_div_close, new_div_close)

    with open('src/app/(dashboard)/stock-adjustments/new/page.tsx', 'w') as f:
        f.write(code)

patch()
