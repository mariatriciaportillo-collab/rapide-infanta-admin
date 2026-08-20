import re

def patch():
    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'r') as f:
        code = f.read()

    # 1. Update imports
    code = code.replace(
        "import { PartSearchSelector } from '@/components/parts/PartSearchSelector'\nimport { SupplierModal } from '@/components/suppliers/SupplierModal'",
        "import { PartSearchSelector } from '@/components/parts/PartSearchSelector'\nimport { SupplierSearchSelector } from '@/components/suppliers/SupplierSearchSelector'"
    )

    # 2. Remove supplier list logic and modal state if we replace it completely
    # Actually wait, I can just replace the block with SupplierSearchSelector and it will manage its own modal!
    # Let's remove the extra modal rendering from the page.
    
    # Remove isSupplierModalOpen state
    code = code.replace(
        "const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)\n  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)",
        "const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)"
    )

    # We can also remove `suppliers`, `setSuppliers`, `fetchSuppliers` if we only use the selector, but let's keep them if they are small or just let SupplierSearchSelector handle it.
    # We will just replace the markup.

    old_supplier_html = """            <div>
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
            
    new_supplier_html = """            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
              <SupplierSearchSelector 
                selectedSupplierId={supplierId}
                setSelectedSupplierId={setSupplierId}
              />
            </div>"""

    code = code.replace(old_supplier_html, new_supplier_html)

    # 3. Remove the modal injection at the end of the file
    old_modal_render = """
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
    
    new_modal_render = """
    </div>
  )
}"""

    code = code.replace(old_modal_render, new_modal_render)

    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'w') as f:
        f.write(code)

patch()
