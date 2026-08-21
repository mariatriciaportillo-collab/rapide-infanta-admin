'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'
import { SupplierSearchSelector } from '@/components/suppliers/SupplierSearchSelector'

type POItem = {
  id: string
  partId: string
  part: any
  qty: string
  unitCost: string
  vehicleId: string | null
  manualVehicle: string
  chassisNumber: string
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  
  const [hasVehicleDetails, setHasVehicleDetails] = useState(false)
  const [taxTreatment, setTaxTreatment] = useState('NON_VAT') // 'NON_VAT', 'VAT_INCLUSIVE', 'VAT_EXCLUSIVE'
  
  const [items, setItems] = useState<POItem[]>([
    { id: 'initial-row-1', partId: '', part: null, qty: '', unitCost: '', vehicleId: null, manualVehicle: '', chassisNumber: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Post-save shortcut state
  const [savedPoId, setSavedPoId] = useState<string | null>(null)
  const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)

  useEffect(() => {
    setOrderDate(new Date().toISOString().split('T')[0])
    fetchSuppliers()
    fetchVehicles()
  }, [])

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('id, name').eq('is_active', true).order('name')
    if (data) setSuppliers(data)
  }

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('id, make, model, year, vin, plate_number').order('make')
    if (data) setVehicles(data)
  }

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', vehicleId: null, manualVehicle: '', chassisNumber: '' }])
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }

  const handleUpdateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        
        // Auto populate fields
        if (field === 'part' && value) {
          updated.partId = value.id
          updated.unitCost = value.cost || '0'
        }
        
        if (field === 'manualVehicle') {
          const match = vehicles.find(v => `${v.make} ${v.model} ${v.year || ''}`.trim().toLowerCase() === String(value).trim().toLowerCase())
          if (match) {
            updated.vehicleId = match.id
            if (match.vin && !item.chassisNumber) updated.chassisNumber = match.vin
          } else {
            updated.vehicleId = null
          }
        }
        
        return updated
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!supplierId) {
      setError('Please select a supplier.')
      setIsSubmitting(false)
      return
    }

    const validItems = items.filter(i => i.partId && Number(i.qty) > 0)
    if (validItems.length === 0) {
      setError('Please add at least one valid item with a quantity greater than 0.')
      setIsSubmitting(false)
      return
    }

    const rpcItems = validItems.map(i => ({
      part_id: i.partId,
      qty: Number(i.qty),
      unit_cost: Number(i.unitCost) || 0,
      total_amount: (Number(i.qty) * (Number(i.unitCost) || 0)),
      vehicle_id: hasVehicleDetails ? i.vehicleId : null,
      manual_vehicle: hasVehicleDetails ? (i.manualVehicle || null) : null,
      chassis_number: hasVehicleDetails ? (i.chassisNumber || null) : null
    }))

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', {
      p_supplier_id: supplierId || null,
      p_order_date: orderDate || null,
      p_expected_date: expectedDate || null,
      p_reference: reference || null,
      p_terms: terms || null,
      p_notes: notes || null,
      p_items: rpcItems,
      p_user_id: userId || null,
      p_has_vehicle_details: hasVehicleDetails,
      p_tax_treatment: taxTreatment
    })

    if (rpcError) {
      setError(rpcError.message)
      setIsSubmitting(false)
    } else if (data) {
      const { data: poData } = await supabase.from('purchase_orders').select('po_number').eq('id', data).single()
      setSavedPoId(data)
      if (poData) setSavedPoNumber(poData.po_number)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitCost) || 0), 0)

  if (savedPoId) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Purchase Order Created!</h2>
          <p className="text-slate-600 mb-8">
            {savedPoNumber ? `Purchase order ${savedPoNumber} has been saved successfully.` : 'The purchase order has been saved successfully.'}
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                setSavedPoId(null)
                setSavedPoNumber(null)
                setItems([{ id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', vehicleId: null, manualVehicle: '', chassisNumber: '' }])
                setReference('')
                setNotes('')
                setIsSubmitting(false)
              }}
              className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Create Another PO
            </button>
            <Link 
              href={`/purchase-orders/${savedPoId}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
            >
              View Purchase Order
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/purchase-orders" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">New Purchase Order</h1>
          <p className="text-slate-500 mt-1">Create a new order for inventory or specific vehicles.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
              <SupplierSearchSelector selectedSupplierId={supplierId} setSelectedSupplierId={setSupplierId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order Date *</label>
              <input 
                type="date" 
                required
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery Date</label>
              <input 
                type="date" 
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
              <input 
                type="text" 
                placeholder="Quote #, Reference..."
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Purchase Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Details</label>
              <select 
                value={hasVehicleDetails ? 'YES' : 'NO'}
                onChange={e => setHasVehicleDetails(e.target.value === 'YES')}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="NO">No Vehicle Details (Standard PO)</option>
                <option value="YES">Include Vehicle Details (Spare Parts)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax Treatment</label>
              <select 
                value={taxTreatment}
                onChange={e => setTaxTreatment(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="NON_VAT">Non-VAT / No VAT Breakdown</option>
                <option value="VAT_INCLUSIVE">VAT Inclusive</option>
                <option value="VAT_EXCLUSIVE">VAT Exclusive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Order Items</h2>
            <button 
              type="button"
              onClick={handleAddItem}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={16} /> Add Item Row
            </button>
          </div>
          
          <datalist id="vehicles-list">
            {vehicles.map(v => (
              <option key={v.id} value={`${v.make} ${v.model} ${v.year || ''}`.trim()} />
            ))}
          </datalist>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  {hasVehicleDetails && <th className="px-4 py-3 w-48">Vehicle / Unit</th>}
                  {hasVehicleDetails && <th className="px-4 py-3 w-40">Chassis No.</th>}
                  <th className="px-4 py-3 w-64">Item / Description *</th>
                  <th className="px-4 py-3 w-24">Qty *</th>
                  <th className="px-4 py-3 w-32">Unit Cost</th>
                  <th className="px-4 py-3 w-32 text-right">Amount</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.unitCost) || 0)
                  return (
                    <tr key={item.id} className="bg-white hover:bg-slate-50 transition">
                      {hasVehicleDetails && (
                        <td className="px-4 py-3">
                          <input 
                            type="text"
                            list="vehicles-list"
                            placeholder="e.g. Suzuki Jimny"
                            value={item.manualVehicle}
                            onChange={(e) => handleUpdateItem(item.id, 'manualVehicle', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                          />
                        </td>
                      )}
                      {hasVehicleDetails && (
                        <td className="px-4 py-3">
                          <input 
                            type="text"
                            placeholder="VIN/Chassis"
                            value={item.chassisNumber}
                            onChange={(e) => handleUpdateItem(item.id, 'chassisNumber', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 relative">
                        <PartSearchSelector 
                          selectedPartId={item.partId}
                          onSelectPart={(p) => handleUpdateItem(item.id, 'part', p)}
                          error={!item.partId && isSubmitting} setSelectedPartId={() => {}}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          min="1"
                          required
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                          className={`w-full p-2 border rounded-md text-sm outline-none focus:border-blue-500 ${isSubmitting && !item.qty ? 'border-red-500' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItem(item.id, 'unitCost', e.target.value)}
                            className="w-full pl-7 pr-2 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        ₱{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          className={`text-slate-400 hover:text-red-500 transition ${items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <div className="w-64">
              {taxTreatment === 'VAT_INCLUSIVE' && (
                <>
                  <div className="flex justify-between py-1 text-sm text-slate-600">
                    <span>VATable Amount</span>
                    <span>₱{(subtotal / 1.12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-slate-600">
                    <span>VAT (12%)</span>
                    <span>₱{(subtotal - (subtotal / 1.12)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              {taxTreatment === 'VAT_EXCLUSIVE' && (
                <>
                  <div className="flex justify-between py-1 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-slate-600">
                    <span>VAT (12%)</span>
                    <span>₱{(subtotal * 0.12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2 mt-2 border-t border-slate-200 font-bold text-lg text-slate-900">
                <span>Total Amount</span>
                <span>₱{(taxTreatment === 'VAT_EXCLUSIVE' ? subtotal * 1.12 : subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms / Conditions</label>
              <textarea 
                rows={3}
                value={terms}
                onChange={e => setTerms(e.target.value)}
                placeholder="Payment terms, delivery conditions..."
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Internal notes or instructions for the supplier..."
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link 
            href="/purchase-orders"
            className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
            ) : (
              <><Save size={18} /> Save Purchase Order</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
