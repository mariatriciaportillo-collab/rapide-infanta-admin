import re

def patch():
    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'r') as f:
        code = f.read()

    # 1. Add SupplierModal import
    if "import { SupplierModal }" not in code:
        code = code.replace(
            "import { PartSearchSelector } from '@/components/parts/PartSearchSelector'",
            "import { PartSearchSelector } from '@/components/parts/PartSearchSelector'\nimport { SupplierModal } from '@/components/suppliers/SupplierModal'"
        )

    # 2. Add isSupplierModalOpen state
    state_injection = """  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)"""
    if "isSupplierModalOpen" not in code:
        code = code.replace(
            "const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)",
            "const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)\n  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)"
        )

    # 3. Modify Supplier selector
    old_supplier_html = """            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
              <select 
                required
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>"""
            
    new_supplier_html = """            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">Supplier *</label>
                <button 
                  type="button" 
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={12} /> Add New Supplier
                </button>
              </div>
              <select 
                required
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>"""
    
    code = code.replace(old_supplier_html, new_supplier_html)

    # 4. Inject Modal rendering before closing div
    modal_render = """
      {isSupplierModalOpen && (
        <SupplierModal 
          onClose={() => setIsSupplierModalOpen(false)}
          onSuccess={(newSupplier) => {
            setSuppliers(prev => [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)))
            setSupplierId(newSupplier.id)
            setIsSupplierModalOpen(false)
          }}
        />
      )}
    </div>
  )
}"""
    code = code.replace("    </div>\n  )\n}", modal_render)

    # 5. Check explicitly the RPC params
    old_rpc_call = """    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', {
      p_supplier_id: supplierId,
      p_order_date: orderDate,
      p_expected_date: expectedDate || null,
      p_reference: reference,
      p_notes: notes,
      p_terms: terms,
      p_items: rpcItems,
      p_user_id: userId
    })"""
    
    new_rpc_call = """    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', {
      p_supplier_id: supplierId || null,
      p_order_date: orderDate || null,
      p_expected_date: expectedDate || null,
      p_reference: reference || null,
      p_notes: notes || null,
      p_terms: terms || null,
      p_items: rpcItems,
      p_user_id: userId || null
    })"""
    
    code = code.replace(old_rpc_call, new_rpc_call)

    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'w') as f:
        f.write(code)

patch()
