const fs = require('fs')

// SidebarNav
let sidebar = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8')
if (!sidebar.includes('const [reportsOpen')) {
    sidebar = sidebar.replace('const [inventoryOpen, setInventoryOpen] = useState(false)', 'const [inventoryOpen, setInventoryOpen] = useState(false)\n  const [reportsOpen, setReportsOpen] = useState(false)\n  const [adminOpen, setAdminOpen] = useState(false)')
}
if (!sidebar.includes('const isReportsActive')) {
    sidebar = sidebar.replace("const isInventoryActive = pathname?.startsWith('/inventory') || pathname?.startsWith('/stock-adjustments') || pathname?.startsWith('/outside-purchases') || pathname?.startsWith('/purchase-orders') || pathname?.startsWith('/suppliers')", "const isInventoryActive = pathname?.startsWith('/inventory') || pathname?.startsWith('/stock-adjustments') || pathname?.startsWith('/outside-purchases') || pathname?.startsWith('/purchase-orders') || pathname?.startsWith('/suppliers')\n  const isReportsActive = pathname?.startsWith('/reports')\n  const isAdminActive = pathname?.startsWith('/admin')")
}
fs.writeFileSync('src/components/SidebarNav.tsx', sidebar)

// Quotation [id]
let qid = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8')
if (!qid.includes('const [isUpdating')) {
    qid = qid.replace('const [quote, setQuote] = useState<any>(null)', `const [quote, setQuote] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCompleteService = async () => {
    if (!confirm('Mark this service as COMPLETED and generate Service History?')) return;
    setIsUpdating(true)
    
    // 1. Mark status as COMPLETED
    const { error: quoteErr } = await supabase.from('quotations').update({ status: 'COMPLETED' }).eq('id', quote.id)
    if (quoteErr) {
      alert('Failed to update status')
      setIsUpdating(false)
      return
    }

    // 2. Determine Service Name and Oil Type from items
    let mainService = 'General Repair'
    let oilType = null
    const parts = []
    
    if (quote.quotation_items) {
      const pmsItem = quote.quotation_items.find((i) => (i.item_name || '').toUpperCase().includes('PMS'))
      const oilItem = quote.quotation_items.find((i) => (i.item_name || '').toUpperCase().includes('OIL'))
      
      if (pmsItem) mainService = pmsItem.item_name
      else if (oilItem) mainService = 'Oil Change'
      
      // Attempt to guess oil type from parts
      const oilPart = quote.quotation_items.find((i) => i.type === 'part' && (i.item_name || '').toUpperCase().includes('OIL'))
      if (oilPart) {
        const name = oilPart.item_name.toUpperCase()
        if (name.includes('FULLY')) oilType = 'Fully Synthetic'
        else if (name.includes('SEMI')) oilType = 'Semi Synthetic'
        else oilType = 'Regular / Mineral'
      }
      
      // push parts
      quote.quotation_items.filter((i) => i.type === 'part').forEach((p) => parts.push(p.item_name))
    }

    // 3. Determine next due based on settings
    let nextDueDate = null
    let nextDueMileage = null
    if (oilType || mainService.includes('PMS') || mainService.includes('Oil Change')) {
      const classif = oilType || 'Regular / Mineral'
      const { data: intervals } = await supabase.from('service_intervals').select('*').eq('classification', classif).limit(1)
      if (intervals && intervals.length > 0) {
        const rules = intervals[0]
        const currentMileage = parseInt(String(quote.mileage).replace(/[^0-9]/g, '')) || 0
        if (currentMileage > 0 && rules.kilometers > 0) {
          nextDueMileage = currentMileage + rules.kilometers
        }
        if (rules.months > 0) {
          const d = new Date()
          d.setMonth(d.getMonth() + rules.months)
          nextDueDate = d.toISOString().split('T')[0]
        }
      }
    }

    // 4. Create Service History
    const { error: histErr } = await supabase.from('service_history').insert([{
      vehicle_id: quote.vehicle_id,
      customer_id: quote.customer_id,
      invoice_id: null,
      mileage: quote.mileage ? parseInt(String(quote.mileage).replace(/[^0-9]/g, '')) : null,
      service_name: mainService,
      oil_type: oilType,
      parts_used: parts,
      next_due_date: nextDueDate,
      next_due_mileage: nextDueMileage
    }])

    setIsUpdating(false)
    if (histErr) {
      console.error(histErr)
      alert('Service marked completed, but failed to log history.')
    }
    
    // Refresh
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
  }

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true)
    await supabase.from('quotations').update({ status: newStatus }).eq('id', quote.id)
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
    setIsUpdating(false)
  }`)
}
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', qid)

