'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

type LineItem = {
  id: string
  description: string
  quantity: number | ''
  unit_price: number | ''
  is_section_header: boolean
}

export default function NewQuotationPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [mileage, setMileage] = useState('')

  const [notes, setNotes] = useState('')
  const [warranty, setWarranty] = useState('3 Months / 5,000km (Whichever comes first)')
  const [preparedBy, setPreparedBy] = useState('Rapide Infanta Admin')
  const [discount, setDiscount] = useState<number>(0)

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: '', is_section_header: false }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed Totals
  const subtotal = items.reduce((sum, item) => {
    if (item.is_section_header) return sum
    const q = Number(item.quantity) || 0
    const p = Number(item.unit_price) || 0
    return sum + (q * p)
  }, 0)
  
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0))

  const addItem = (isHeader: boolean) => {
    setItems([
      ...items, 
      { 
        id: Math.random().toString(36).substr(2, 9), 
        description: '', 
        quantity: isHeader ? '' : 1, 
        unit_price: isHeader ? '' : '', 
        is_section_header: isHeader 
      }
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Generate Quote Number (e.g. INFANTA-YYYYMMDD-XXXX)
      const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const randomPart = Math.floor(1000 + Math.random() * 9000)
      const quoteNumber = `INFANTA-${datePart}-${randomPart}`

      // 2. Insert Quotation
      const { data: quote, error: quoteError } = await supabase
        .from('quotations')
        .insert({
          quote_number: quoteNumber,
          customer_name: customerName || 'Unknown Customer',
          customer_email: customerEmail,
          customer_address: customerAddress,
          vehicle_plate: vehiclePlate || 'Unknown Plate',
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
          mileage_km: mileage ? parseFloat(mileage) : null,
          status: 'DRAFT',
          prepared_by: preparedBy,
          notes: notes,
          warranty_terms: warranty,
          subtotal: subtotal,
          discount_amount: Number(discount) || 0,
          grand_total: grandTotal
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      // 3. Insert Line Items
      const itemsToInsert = items
        .filter(i => i.description.trim() !== '') // Skip empty lines
        .map((item, index) => ({
          quotation_id: quote.id,
          sort_order: index,
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header
        }))

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsToInsert)
          
        if (itemsError) throw itemsError
      }

      // 4. Redirect to view page
      router.push(`/quotations/${quote.id}`)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while saving the quotation.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/quotations" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">New Quotation</h2>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving...' : 'Save Quotation'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Customer Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Juan Dela Cruz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="juan@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123 Main St, Infanta" />
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
              <input required type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC 1234" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input type="number" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2018" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mileage (km)</label>
              <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="50000" />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Line Items</h3>
          <div className="space-x-2">
            <button type="button" onClick={() => addItem(true)} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Section Header
            </button>
            <button type="button" onClick={() => addItem(false)} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Item
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className={`flex gap-3 items-start ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2' : ''}`}>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder={item.is_section_header ? "e.g. LABOR CHARGES" : "Item description..."}
                  className={`w-full border border-slate-300 rounded-md p-2 ${item.is_section_header ? 'font-bold bg-transparent' : ''}`}
                  required={!item.is_section_header}
                />
              </div>
              
              {!item.is_section_header && (
                <>
                  <div className="w-24">
                    <input 
                      type="number" 
                      min="0.1" step="0.1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full border border-slate-300 rounded-md p-2"
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      min="0" step="0.01"
                      value={item.unit_price}
                      onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                      placeholder="Unit Price"
                      className="w-full border border-slate-300 rounded-md p-2"
                    />
                  </div>
                  <div className="w-32 py-2 text-right font-medium text-slate-700">
                    ₱{((Number(item.quantity)||0) * (Number(item.unit_price)||0)).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                </>
              )}
              
              {item.is_section_header && (
                <div className="w-24"></div>
              )}
              {item.is_section_header && (
                <div className="w-32"></div>
              )}
              {item.is_section_header && (
                <div className="w-32"></div>
              )}

              <button 
                type="button" 
                onClick={() => removeItem(item.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-slate-500 py-4">No items added yet.</p>
          )}
        </div>
      </div>

      {/* Footer / Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Terms</label>
              <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prepared By</label>
              <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md p-2" placeholder="Any additional notes..."></textarea>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white rounded-lg shadow-sm p-6 flex flex-col justify-end">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Discount</span>
              <div className="w-32 flex items-center">
                <span className="mr-2">₱</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={e => setDiscount(Number(e.target.value))} 
                  className="w-full bg-slate-700 border-none rounded p-1 text-white text-right" 
                  min="0"
                />
              </div>
            </div>
            <div className="h-px bg-slate-600 my-4"></div>
            <div className="flex justify-between text-2xl font-bold text-yellow-400">
              <span>Grand Total</span>
              <span>₱{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
