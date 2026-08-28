const fs = require('fs')

let nav = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8')
nav = nav.replace('const isInventoryActive = [\'/inventory\', \'/stock-adjustments\', \'/outside-purchases\', \'/purchase-orders\', \'/suppliers\'].some(route => pathname?.startsWith(route))', 
`const isInventoryActive = ['/inventory', '/stock-adjustments', '/outside-purchases', '/purchase-orders', '/suppliers'].some(route => pathname?.startsWith(route))
  const isReportsActive = pathname?.startsWith('/reports')
  const isAdminActive = pathname?.startsWith('/admin')`)

nav = nav.replace('const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive)',
`const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive)
  const [reportsOpen, setReportsOpen] = useState(isReportsActive)
  const [adminOpen, setAdminOpen] = useState(isAdminActive)`)

fs.writeFileSync('src/components/SidebarNav.tsx', nav)

let quote = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8')
// Look for where the buttons are added without the functions being added
if (!quote.includes('const [isUpdating')) {
    quote = quote.replace('const [quote, setQuote] = useState<any>(null)',
`const [quote, setQuote] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCompleteService = async () => {
    if (!confirm('Mark this service as COMPLETED and generate Service History?')) return;
    setIsUpdating(true)
    const { error: quoteErr } = await supabase.from('quotations').update({ status: 'COMPLETED' }).eq('id', quote.id)
    if (quoteErr) { alert('Failed to update status'); setIsUpdating(false); return }
    let mainService = 'General Repair', oilType = null, parts = []
    if (quote.quotation_items) {
      const pmsItem = quote.quotation_items.find((i:any) => (i.item_name || '').toUpperCase().includes('PMS'))
      const oilItem = quote.quotation_items.find((i:any) => (i.item_name || '').toUpperCase().includes('OIL'))
      if (pmsItem) mainService = pmsItem.item_name
      else if (oilItem) mainService = 'Oil Change'
      const oilPart = quote.quotation_items.find((i:any) => i.type === 'part' && (i.item_name || '').toUpperCase().includes('OIL'))
      if (oilPart) {
        const name = oilPart.item_name.toUpperCase()
        if (name.includes('FULLY')) oilType = 'Fully Synthetic'
        else if (name.includes('SEMI')) oilType = 'Semi Synthetic'
        else oilType = 'Regular / Mineral'
      }
      quote.quotation_items.filter((i:any) => i.type === 'part').forEach((p:any) => parts.push(p.item_name))
    }
    let nextDueDate = null, nextDueMileage = null
    if (oilType || mainService.includes('PMS') || mainService.includes('Oil Change')) {
      const classif = oilType || 'Regular / Mineral'
      const { data: intervals } = await supabase.from('service_intervals').select('*').eq('classification', classif).limit(1)
      if (intervals && intervals.length > 0) {
        const rules = intervals[0]
        const currentMileage = parseInt(String(quote.mileage).replace(/[^0-9]/g, '')) || 0
        if (currentMileage > 0 && rules.kilometers > 0) nextDueMileage = currentMileage + rules.kilometers
        if (rules.months > 0) {
          const d = new Date()
          d.setMonth(d.getMonth() + rules.months)
          nextDueDate = d.toISOString().split('T')[0]
        }
      }
    }
    const { error: histErr } = await supabase.from('service_history').insert([{
      vehicle_id: quote.vehicle_id, customer_id: quote.customer_id, invoice_id: null,
      mileage: quote.mileage ? parseInt(String(quote.mileage).replace(/[^0-9]/g, '')) : null,
      service_name: mainService, oil_type: oilType, parts_used: parts, next_due_date: nextDueDate, next_due_mileage: nextDueMileage
    }])
    setIsUpdating(false)
    if (histErr) { console.error(histErr); alert('Failed to log history.') }
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    await supabase.from('quotations').update({ status: newStatus }).eq('id', quote.id)
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
    setIsUpdating(false)
  }`)
}
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', quote)
