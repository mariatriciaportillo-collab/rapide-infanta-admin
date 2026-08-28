import re

# 1. SidebarNav.tsx
with open('src/components/SidebarNav.tsx', 'r') as f:
    nav = f.read()

# Add states
if "const [reportsOpen" not in nav:
    nav = nav.replace("const [inventoryOpen, setInventoryOpen] = useState(false)", 
                      "const [inventoryOpen, setInventoryOpen] = useState(false)\n  const [reportsOpen, setReportsOpen] = useState(false)\n  const [adminOpen, setAdminOpen] = useState(false)")

# Add active checks
if "const isReportsActive" not in nav:
    nav = nav.replace("const isInventoryActive = pathname?.startsWith('/inventory') || pathname?.startsWith('/stock-adjustments') || pathname?.startsWith('/outside-purchases') || pathname?.startsWith('/purchase-orders') || pathname?.startsWith('/suppliers')",
                      "const isInventoryActive = pathname?.startsWith('/inventory') || pathname?.startsWith('/stock-adjustments') || pathname?.startsWith('/outside-purchases') || pathname?.startsWith('/purchase-orders') || pathname?.startsWith('/suppliers')\n  const isReportsActive = pathname?.startsWith('/reports')\n  const isAdminActive = pathname?.startsWith('/admin')")

# Fix History import conflict. We can alias it: import { History as HistoryIcon } from 'lucide-react'
# Let's completely rebuild the lucide-react import in SidebarNav
import_pattern = r"import \{([^}]+)\} from 'lucide-react'"
def import_repl(match):
    icons = [i.strip() for i in match.group(1).split(',')]
    needed = ["BarChart2", "History as HistoryIcon", "TrendingUp", "MinusCircle", "DollarSign", "Clock", "Shield", "Building2"]
    for n in needed:
        # Check if already imported (History as HistoryIcon needs careful check)
        if n == "History as HistoryIcon":
            if "HistoryIcon" not in icons and "History" not in icons:
                icons.append(n)
            elif "History" in icons and "History as HistoryIcon" not in icons:
                icons.remove("History")
                icons.append(n)
        elif n not in icons:
            icons.append(n)
    return "import { " + ", ".join(icons) + " } from 'lucide-react'"

nav = re.sub(import_pattern, import_repl, nav)
nav = nav.replace("<History size={16} />", "<HistoryIcon size={16} />")

with open('src/components/SidebarNav.tsx', 'w') as f:
    f.write(nav)

# 2. QuotationForm.tsx
with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qform = f.read()

if "const [serviceAdvisorId" not in qform:
    qform = qform.replace("const [preparedBy, setPreparedBy] = useState(initialData?.prepared_by || '')",
                          "const [preparedBy, setPreparedBy] = useState(initialData?.prepared_by || '')\n  const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')\n  const [advisors, setAdvisors] = useState<any[]>([])")

if "setAdvisors(data)" not in qform:
    # There's a stray setAdvisors error in 205? Let's check what's there
    pass # I'll manually check 205 if it fails

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qform)


# 3. quotations/[id]/page.tsx
with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    qpage = f.read()

if "const [isUpdating" not in qpage:
    qpage = qpage.replace("const [quote, setQuote] = useState<any>(null)",
                          """const [quote, setQuote] = useState<any>(null)
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
      const pmsItem = quote.quotation_items.find((i: any) => (i.item_name || '').toUpperCase().includes('PMS'))
      const oilItem = quote.quotation_items.find((i: any) => (i.item_name || '').toUpperCase().includes('OIL'))
      
      if (pmsItem) mainService = pmsItem.item_name
      else if (oilItem) mainService = 'Oil Change'
      
      // Attempt to guess oil type from parts
      const oilPart = quote.quotation_items.find((i: any) => i.type === 'part' && (i.item_name || '').toUpperCase().includes('OIL'))
      if (oilPart) {
        const name = oilPart.item_name.toUpperCase()
        if (name.includes('FULLY')) oilType = 'Fully Synthetic'
        else if (name.includes('SEMI')) oilType = 'Semi Synthetic'
        else oilType = 'Regular / Mineral'
      }
      
      // push parts
      quote.quotation_items.filter((i: any) => i.type === 'part').forEach((p: any) => parts.push(p.item_name))
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

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    await supabase.from('quotations').update({ status: newStatus }).eq('id', quote.id)
    const { data: updatedQuote } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quote.id).single()
    setQuote(updatedQuote)
    setIsUpdating(false)
  }
""")

if "import { useRouter }" not in qpage:
    qpage = qpage.replace("import { createClient } from '@/utils/supabase/client'", "import { createClient } from '@/utils/supabase/client'\nimport { useRouter } from 'next/navigation'")

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(qpage)

