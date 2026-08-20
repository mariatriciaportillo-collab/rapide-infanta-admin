import re

def patch():
    with open('src/app/(dashboard)/stock-adjustments/[id]/StockAdjustmentDetailClient.tsx', 'r') as f:
        code = f.read()

    # Fix fetching logic
    old_fetch = """    // Fetch adjustment
    const { data: adjData } = await supabase
      .from('stock_adjustments')
      .select('*, profiles:created_by(email)')
      .eq('id', id)
      .single()
      
    if (adjData) {
      setAdjustment(adjData)
      
      // Fetch items
      const { data: itemData } = await supabase
        .from('stock_adjustment_items')
        .select('*, parts(name, part_number, unit)')
        .eq('adjustment_id', id)
        .order('id')
        
      if (itemData) setItems(itemData)
    }"""
    
    new_fetch = """    // Fetch adjustment
    const { data: adjData } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('id', id)
      .eq('type', 'ADJUSTMENT')
      .single()
      
    if (adjData) {
      setAdjustment(adjData)
      
      // Fetch items
      const { data: itemData } = await supabase
        .from('inventory_movements')
        .select('*, parts(name, part_number, unit, stock_quantity)')
        .eq('transaction_id', id)
        .order('id')
        
      if (itemData) setItems(itemData)
    }"""
    code = code.replace(old_fetch, new_fetch)

    # Fix display logic
    old_created = "<div className=\"font-medium text-slate-800\">{adjustment.profiles?.email || 'Unknown User'}</div>"
    new_created = "<div className=\"font-medium text-slate-800 text-sm\">{adjustment.created_by || 'Unknown'}</div>"
    code = code.replace(old_created, new_created)

    old_table_body = """            {items.map(item => {
              const prev = Number(item.previous_stock)
              const newQty = Number(item.resulting_stock)
              const change = Number(item.quantity)
              const unit = item.parts?.unit || 'pcs'

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.parts?.name || 'Unknown Part'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-mono">{item.parts?.part_number || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      item.adjustment_type === 'Increase Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.adjustment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {item.adjustment_type === 'Increase Stock' ? '+' : '-'}{change} {unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="flex items-center justify-end gap-2 text-sm font-medium">
                      <span className="text-slate-400">{prev}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-slate-800 font-bold">{newQty}</span>
                    </span>
                  </td>
                </tr>
              )
            })}"""
            
    new_table_body = """            {items.map(item => {
              const change = Number(item.quantity)
              const unit = item.parts?.unit || 'pcs'
              const isPositive = change > 0
              
              // Note: Since historical stock isn't saved per-row, we display current parts stock as a proxy for the resulting stock if it's recent, or we just show the adjustment.
              const currentStock = Number(item.parts?.stock_quantity) || 0
              const prev = currentStock - change

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.parts?.name || 'Unknown Part'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-mono">{item.parts?.part_number || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isPositive ? 'Increase Stock' : 'Decrease Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {isPositive ? '+' : ''}{change} {unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="flex items-center justify-end gap-2 text-sm font-medium">
                      <span className="text-slate-400">{prev}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-slate-800 font-bold">{currentStock}</span>
                    </span>
                  </td>
                </tr>
              )
            })}"""
    code = code.replace(old_table_body, new_table_body)

    with open('src/app/(dashboard)/stock-adjustments/[id]/StockAdjustmentDetailClient.tsx', 'w') as f:
        f.write(code)

patch()
