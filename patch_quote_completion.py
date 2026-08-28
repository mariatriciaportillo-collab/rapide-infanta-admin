import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

# 1. Add mark completed logic
imports_pattern = r"import \{ createClient \} from '@\/utils\/supabase\/client'"
imports_repl = r"""import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'"""
if "import { useRouter }" not in content:
    content = re.sub(imports_pattern, imports_repl, content)

state_pattern = r"const \[quote, setQuote\] = useState<any>\(null\)"
state_repl = r"""const [quote, setQuote] = useState<any>(null)
  const router = useRouter()
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
      const pmsItem = quote.quotation_items.find(i => (i.item_name || '').toUpperCase().includes('PMS'))
      const oilItem = quote.quotation_items.find(i => (i.item_name || '').toUpperCase().includes('OIL'))
      
      if (pmsItem) mainService = pmsItem.item_name
      else if (oilItem) mainService = 'Oil Change'
      
      // Attempt to guess oil type from parts
      const oilPart = quote.quotation_items.find(i => i.type === 'part' && (i.item_name || '').toUpperCase().includes('OIL'))
      if (oilPart) {
        const name = oilPart.item_name.toUpperCase()
        if (name.includes('FULLY')) oilType = 'Fully Synthetic'
        else if (name.includes('SEMI')) oilType = 'Semi Synthetic'
        else oilType = 'Regular / Mineral'
      }
      
      // push parts
      quote.quotation_items.filter(i => i.type === 'part').forEach(p => parts.push(p.item_name))
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
      invoice_id: null, // Since we don't have invoices yet
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

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    await supabase.from('quotations').update({ status: newStatus }).eq('id', quote.id)
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
    setIsUpdating(false)
  }
"""
if "handleCompleteService" not in content:
    content = re.sub(state_pattern, state_repl, content)

# 2. Add buttons in UI
buttons_pattern = r"<button className=\"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm\">\n\s*<CheckCircle2 size=\{18\} \/>\n\s*Mark Approved\n\s*<\/button>"
buttons_repl = r"""{quote.status === 'DRAFT' && (
            <button onClick={() => handleUpdateStatus('APPROVED')} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={18} /> Mark Approved
            </button>
          )}
          {quote.status === 'APPROVED' && (
            <button onClick={handleCompleteService} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={18} /> Complete Service
            </button>
          )}"""
content = re.sub(buttons_pattern, buttons_repl, content)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
