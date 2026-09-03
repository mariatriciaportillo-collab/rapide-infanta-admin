'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { checkDuplicateCustomer } from '@/utils/checkDuplicateCustomer'
import { Plus, Trash2, ArrowLeft, Save, Search, User, Car, Building2, Edit, X } from 'lucide-react'
import Link from 'next/link'
import { formatCustomerName, formatContactPerson, buildLegacyName } from '@/utils/customer'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

export function QuickSaleForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()

  // Base
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Customer
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialData?.customer_id || null)
  const [customers, setCustomers] = useState<any[]>([])
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)

  // Customer Form
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [customerTelephone, setCustomerTelephone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerTin, setCustomerTin] = useState('')

  // Vehicle
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialData?.vehicle_id || null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)

  // Vehicle Form
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [engineNumber, setEngineNumber] = useState('')
  const [chassisNumber, setChassisNumber] = useState('')
  const [color, setColor] = useState('')
  const [engineCapacity, setEngineCapacity] = useState('')
  const [vehicleTransmission, setVehicleTransmission] = useState('')

  // Items & Pricing
  const [items, setItems] = useState<any[]>(initialData?.quick_sale_items || [])
  const [discount, setDiscount] = useState<number>(initialData?.discount_amount || 0)
  const [notes, setNotes] = useState(initialData?.notes || '')
  
  const [preparedBy, setPreparedBy] = useState(initialData?.prepared_by || '')

  useEffect(() => {
    if (!initialData) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const userMetaName = user.user_metadata?.first_name 
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
            : user.email?.split('@')[0] || 'Unknown User'
          setPreparedBy(userMetaName)
        }
      })
    } else {
      if (initialData.customer_id) loadCustomerDetails(initialData.customer_id)
      if (initialData.vehicle_id) loadVehicleDetails(initialData.vehicle_id)
    }
  }, [initialData])

  // Customer Search Effect
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearch.length < 2) { setCustomers([]); return; }
      const searchTerm = customerSearch.trim()
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,legacy_name.ilike.%${searchTerm}%`)
        .limit(10)
      if (data) setCustomers(data)
    }
    const timeout = setTimeout(searchCustomers, 300)
    return () => clearTimeout(timeout)
  }, [customerSearch])

  // Vehicle Search Effect
  useEffect(() => {
    const searchVehicles = async () => {
      if (vehicleSearch.length < 2 || !selectedCustomerId) { setVehicles([]); return; }
      const searchTerm = vehicleSearch.trim()
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .or(`plate_number.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
        .limit(10)
      if (data) setVehicles(data)
    }
    const timeout = setTimeout(searchVehicles, 300)
    return () => clearTimeout(timeout)
  }, [vehicleSearch, selectedCustomerId])

  const loadCustomerDetails = async (id: string) => {
    const { data } = await supabase.from('customers').select('*').eq('id', id).single()
    if (data) {
      setCustomerType(data.customer_type)
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setCompanyName(data.company_name || '')
      setContactFirstName(data.contact_first_name || '')
      setContactLastName(data.contact_last_name || '')
      setCustomerTelephone(data.telephone || '')
      setCustomerEmail(data.email || '')
      setCustomerAddress(data.address || '')
      setCustomerTin(data.tin || '')
      setCustomerSearch(formatCustomerName(data))
    }
  }

  const loadVehicleDetails = async (id: string) => {
    const { data } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (data) {
      setVehiclePlate(data.plate_number || '')
      setVehicleMake(data.make || '')
      setVehicleModel(data.model || '')
      setVehicleYear(data.year?.toString() || '')
      setEngineNumber(data.engine_number || '')
      setChassisNumber(data.chassis_number || '')
      setColor(data.color || '')
      setEngineCapacity(data.engine_capacity || '')
      setVehicleTransmission(data.transmission || '')
      setVehicleSearch(`${data.make} ${data.model} - ${data.plate_number}`)
    }
  }

  const handleCreateNewCustomer = async () => {
    setError(null)
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompanyName = companyName.trim()
    
    if (customerType === 'individual' && (!cleanFirstName || !cleanLastName)) {
      setError("First Name and Last Name are required."); return;
    }
    if (customerType === 'company' && !cleanCompanyName) {
      setError("Company Name is required."); return;
    }
    
    const duplicate = await checkDuplicateCustomer(supabase, customerType, cleanFirstName, cleanLastName, cleanCompanyName)
    if (duplicate) {
      setError("Customer already exists. Please select the existing customer instead."); return;
    }
    
    const legacyName = buildLegacyName(customerType, cleanFirstName, cleanLastName, cleanCompanyName)
    
    const { data, error } = await supabase.from('customers').insert({
      customer_type: customerType,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      company_name: cleanCompanyName,
      legacy_name: legacyName,
      contact_first_name: contactFirstName.trim(),
      contact_last_name: contactLastName.trim(),
      telephone: customerTelephone,
      email: customerEmail,
      address: customerAddress,
      tin: customerTin
    }).select().single()

    if (error) { setError(error.message); return; }
    setSelectedCustomerId(data.id)
    setCustomerSearch(formatCustomerName(data))
    setIsAddingCustomer(false)
  }

  const handleSaveCustomerChanges = async () => {
    if (!selectedCustomerId) return;
    setError(null)
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompanyName = companyName.trim()
    const legacyName = buildLegacyName(customerType, cleanFirstName, cleanLastName, cleanCompanyName)
    
    const { data, error } = await supabase.from('customers').update({
      customer_type: customerType,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      company_name: cleanCompanyName,
      legacy_name: legacyName,
      contact_first_name: contactFirstName.trim(),
      contact_last_name: contactLastName.trim(),
      telephone: customerTelephone,
      email: customerEmail,
      address: customerAddress,
      tin: customerTin
    }).eq('id', selectedCustomerId).select().single()

    if (error) { setError(error.message); return; }
    setCustomerSearch(formatCustomerName(data))
    setIsEditingCustomer(false)
  }

  const handleCreateNewVehicle = async () => {
    setError(null)
    if (!selectedCustomerId) { setError("Please select a customer first."); return; }
    
    const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
    if (!normalizedPlate) { setError("Plate Number is required."); return; }
    if (!vehicleMake) { setError("Make is required."); return; }
    if (!vehicleModel) { setError("Model is required."); return; }

    const { data, error } = await supabase.from('vehicles').insert({
      customer_id: selectedCustomerId,
      plate_number: normalizedPlate,
      make: vehicleMake.toUpperCase(),
      model: vehicleModel.toUpperCase(),
      year: vehicleYear ? parseInt(vehicleYear) : null,
      engine_number: engineNumber,
      chassis_number: chassisNumber,
      color: color,
      engine_capacity: engineCapacity,
      transmission: vehicleTransmission
    }).select().single()

    if (error) { setError(error.message); return; }
    setSelectedVehicleId(data.id)
    setVehicleSearch(`${data.make} ${data.model} - ${data.plate_number}`)
    setIsAddingVehicle(false)
  }

  const handleSaveVehicleChanges = async () => {
    if (!selectedVehicleId) return;
    setError(null)
    const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
    
    const { data, error } = await supabase.from('vehicles').update({
      plate_number: normalizedPlate,
      make: vehicleMake.toUpperCase(),
      model: vehicleModel.toUpperCase(),
      year: vehicleYear ? parseInt(vehicleYear) : null,
      engine_number: engineNumber,
      chassis_number: chassisNumber,
      color: color,
      engine_capacity: engineCapacity,
      transmission: vehicleTransmission
    }).eq('id', selectedVehicleId).select().single()

    if (error) { setError(error.message); return; }
    setVehicleSearch(`${data.make} ${data.model} - ${data.plate_number}`)
    setIsEditingVehicle(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomerId(null)
    setCustomerSearch('')
    handleClearVehicle()
  }

  const handleClearVehicle = () => {
    setSelectedVehicleId(null)
    setVehicleSearch('')
    setVehiclePlate('')
    setVehicleMake('')
    setVehicleModel('')
    setVehicleYear('')
  }

  // Items Logic
  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        const q = parseFloat(field === 'quantity' ? value : i.quantity) || 0
        const p = parseFloat(field === 'unit_price' ? value : i.unit_price) || 0
        updated.total_price = Number((q * p).toFixed(2))
      }
      return updated
    }))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0))

  const handleSave = async (status: 'DRAFT' | 'UNPAID') => {
    if (!selectedCustomerId) { setError("Customer is required."); return; }
    if (items.length === 0) { setError("Please add at least one item."); return; }
    
    setIsSubmitting(true)
    setError(null)

    try {
      let qsId = initialData?.id
      let qsNumber = initialData?.quick_sale_number

      if (!qsId) {
        // Generate number
        const { data: latest } = await supabase
          .from('quick_sales')
          .select('quick_sale_number')
          .ilike('quick_sale_number', 'QS-%')
          .order('quick_sale_number', { ascending: false })
          .limit(1)
          .single()
        
        let nextSeq = 1
        if (latest && latest.quick_sale_number) {
          const match = latest.quick_sale_number.match(/QS-(\d+)/)
          if (match) nextSeq = parseInt(match[1]) + 1
        }
        qsNumber = `QS-${nextSeq.toString().padStart(6, '0')}`

        const { data: qs, error: qsErr } = await supabase.from('quick_sales').insert({
          quick_sale_number: qsNumber,
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId,
          status,
          subtotal,
          discount_amount: discount || 0,
          grand_total: grandTotal,
          balance_due: grandTotal,
          prepared_by: preparedBy,
          notes,
          inventory_deducted: status === 'UNPAID'
        }).select().single()
        
        if (qsErr) throw new Error(qsErr.message)
        qsId = qs.id
      } else {
        const { error: updErr } = await supabase.from('quick_sales').update({
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId,
          status,
          subtotal,
          discount_amount: discount || 0,
          grand_total: grandTotal,
          balance_due: grandTotal,
          notes,
          inventory_deducted: status === 'UNPAID'
        }).eq('id', qsId)
        if (updErr) throw new Error(updErr.message)
        
        await supabase.from('quick_sale_items').delete().eq('quick_sale_id', qsId)
      }

      // Insert items
      const insertItems = items.map((i, index) => ({
        quick_sale_id: qsId,
        part_id: i.part_id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        sort_order: index
      }))
      
      const { error: itmErr } = await supabase.from('quick_sale_items').insert(insertItems)
      if (itmErr) throw new Error(itmErr.message)

      // If COMPLETED, deduct inventory
      if (status === 'UNPAID' && (!initialData || initialData.status !== 'COMPLETED')) {
        for (const item of items) {
          if (item.part_id) {
            const { data: currentPart } = await supabase.from('parts').select('stock_quantity').eq('id', item.part_id).single()
            if (currentPart) {
              await supabase.from('parts').update({ stock_quantity: Number(currentPart.stock_quantity) - Number(item.quantity) }).eq('id', item.part_id)
            }
          }
        }
      }

      router.push(`/quick-sale/${qsId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Customer & Vehicle Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Customer */}
          <div className="relative">
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Customer <span className="text-red-500">*</span></h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomerId(null); }}
                  placeholder="Search customer..."
                  className="w-full border border-slate-300 rounded p-2 pl-8 text-sm focus:ring-2 focus:ring-blue-500"
                />
                {customers.length > 0 && !selectedCustomerId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {customers.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                        onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(formatCustomerName(c)); setCustomers([]); loadCustomerDetails(c.id); }}
                      >
                        <div className="font-medium text-slate-800">{formatCustomerName(c)}</div>
                        {c.telephone && <div className="text-xs text-slate-500">{c.telephone}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedCustomerId && (
                <>
                  <button type="button" onClick={() => setIsEditingCustomer(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-2 rounded transition" title="Edit Customer"><Edit size={16} /></button>
                  <button type="button" onClick={handleClearCustomer} className="bg-red-50 hover:bg-red-100 text-red-500 px-2 py-2 rounded transition" title="Clear Customer"><X size={16} /></button>
                </>
              )}
              {!selectedCustomerId && (
                <button type="button" onClick={() => { handleClearCustomer(); setIsAddingCustomer(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded transition" title="Add Customer"><Plus size={16} /></button>
              )}
            </div>
          </div>

          {/* Vehicle */}
          <div className="relative">
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Vehicle</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={vehicleSearch}
                  onChange={e => { setVehicleSearch(e.target.value); setSelectedVehicleId(null); }}
                  placeholder={selectedCustomerId ? "Search vehicle..." : "Select customer first"}
                  disabled={!selectedCustomerId}
                  className="w-full border border-slate-300 rounded p-2 pl-8 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                />
                {vehicles.length > 0 && !selectedVehicleId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {vehicles.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                        onClick={() => { setSelectedVehicleId(v.id); setVehicleSearch(`${v.make} ${v.model} - ${v.plate_number}`); setVehicles([]); loadVehicleDetails(v.id); }}
                      >
                        <div className="font-medium text-slate-800 uppercase">{v.plate_number}</div>
                        <div className="text-xs text-slate-500">{v.make} {v.model} {v.year || ''}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedVehicleId && (
                <>
                  <button type="button" onClick={() => setIsEditingVehicle(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-2 rounded transition" title="Edit Vehicle"><Edit size={16} /></button>
                  <button type="button" onClick={handleClearVehicle} className="bg-red-50 hover:bg-red-100 text-red-500 px-2 py-2 rounded transition" title="Clear Vehicle"><X size={16} /></button>
                </>
              )}
              {!selectedVehicleId && (
                <button type="button" disabled={!selectedCustomerId} onClick={() => { handleClearVehicle(); setIsAddingVehicle(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" title="Add Vehicle"><Plus size={16} /></button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Parts & Materials */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Parts & Materials</h3>
        <div className="mb-4">
          <PartSearchSelector 
            selectedPartId={""}
            setSelectedPartId={() => {}}
            onSelectPart={(part) => {
              if (part) {
                setItems(prev => [...prev, {
                  id: crypto.randomUUID(),
                  description: part.name,
                  quantity: 1,
                  unit_price: part.selling_price ?? 0,
                  total_price: part.selling_price ?? 0,
                  part_id: part.id,
                }])
              }
            }}
          />
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            <div className="flex gap-3 px-2 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">
              <div className="flex-1">Description</div>
              <div className="w-20 text-center">Qty</div>
              <div className="w-24 text-right">Unit Price</div>
              <div className="w-24 text-right">Amount</div>
              <div className="w-8"></div>
            </div>
            {items.map(item => (
              <div key={item.id} className="flex gap-3 items-center py-1">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-sm"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="0.1" step="0.1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-sm text-center"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0" step="0.01"
                    value={item.unit_price}
                    onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-sm text-right"
                  />
                </div>
                <div className="w-24 text-right font-medium text-slate-800 self-center text-sm">
                  ₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="w-8 flex justify-end">
                  <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded">
            No items added yet. Search and select parts above.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="Optional notes..."></textarea>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prepared By</label>
              <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50" disabled />
            </div>
          </div>
          
          <div className="w-full md:w-72 bg-slate-50 rounded-lg p-4 flex flex-col justify-end space-y-3">
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span>Discount</span>
              <div className="w-24 flex items-center bg-white border border-slate-300 rounded">
                <span className="px-2 text-slate-400">₱</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={e => setDiscount(Number(e.target.value))} 
                  className="w-full border-none rounded p-1 text-right text-sm focus:ring-0" 
                />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-end text-slate-900 font-bold">
              <span className="text-sm">Grand Total</span>
              <span className="text-xl text-blue-600">₱{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 sticky bottom-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium shadow-sm">
          Cancel
        </button>
        <button type="button" onClick={() => handleSave('DRAFT')} disabled={isSubmitting || initialData?.status === 'UNPAID'} className="px-6 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => handleSave('UNPAID')} disabled={isSubmitting || initialData?.status === 'UNPAID'} className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Processing...' : 'Complete Quick Sale'}
        </button>
      </div>
      
      {/* Note: In a full app, Customer/Vehicle modaling uses identical structure as QuotationForm */}
    </div>
  )
}
