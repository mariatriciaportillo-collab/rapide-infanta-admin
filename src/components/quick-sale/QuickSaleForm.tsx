'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Search, Plus, X, Edit, Trash2, ArrowRightCircle, Save, User, Car, Building2 } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'
import { SearchableCombobox } from '@/components/ui/SearchableCombobox'
import { formatCustomerName, formatContactPerson, buildLegacyName } from '@/utils/customer'
import { saveCustomerRecord } from '@/utils/customerSaveHelper'
import { checkDuplicateCustomer } from '@/utils/checkDuplicateCustomer'

export function QuickSaleForm({ initialData }: { initialData?: any }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preparedBy, setPreparedBy] = useState('Staff')
  
  // Customer State
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialData?.customer_id || null)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  
  // Customer Modal Fields
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [customerTelephone, setCustomerTelephone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerTin, setCustomerTin] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  
  // Vehicle State
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialData?.vehicle_id || null)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isSavingVehicle, setIsSavingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  
  // Vehicle Modal Fields
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vin, setVin] = useState('')
  const [engineCapacity, setEngineCapacity] = useState('')
  const [vehicleTransmission, setVehicleTransmission] = useState('')

  // Items State
  const [items, setItems] = useState<any[]>(initialData?.quick_sale_items?.map((i:any) => ({...i, id: i.id || crypto.randomUUID()})) || [])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [discount, setDiscount] = useState<number | ''>(initialData?.discount_amount || '')

  useEffect(() => {
    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !initialData) {
        const name = user.user_metadata?.first_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
          : user.email?.split('@')[0]
        setPreparedBy(name || 'Staff')
      } else if (initialData?.prepared_by) {
        setPreparedBy(initialData.prepared_by)
      }

      const { data: cData } = await supabase.from('customers').select('*').order('name', { ascending: true })
      if (cData) setCustomers(cData)
    }
    loadInitial()
  }, [supabase, initialData])

  useEffect(() => {
    async function loadVehicles() {
      if (selectedCustomerId) {
        const { data: vData } = await supabase.from('vehicles').select('*').eq('customer_id', selectedCustomerId).order('plate_number', { ascending: true })
        setVehicles(vData || [])
      } else {
        setVehicles([])
        setSelectedVehicleId(null)
      }
    }
    loadVehicles()
  }, [selectedCustomerId, supabase])

  useEffect(() => {
    async function loadCustomerForEdit() {
      if (isEditingCustomer && selectedCustomerId) {
        const cust = customers.find(c => c.id === selectedCustomerId)
        if (cust) {
          setCustomerType(cust.customer_type as 'individual' | 'company' || 'individual')
          setFirstName(cust.first_name || '')
          setLastName(cust.last_name || '')
          setCompanyName(cust.company_name || cust.name || '')
          setCustomerMobile(cust.mobile || '')
          setCustomerTelephone(cust.telephone || '')
          setCustomerEmail(cust.email || '')
          setCustomerAddress(cust.address || '')
          setCustomerTin(cust.tin || '')
          if (cust.contact_person) {
            const parts = cust.contact_person.split(' ')
            setContactFirstName(parts[0] || '')
            setContactLastName(parts.slice(1).join(' ') || '')
          }
        }
      }
    }
    loadCustomerForEdit()
  }, [isEditingCustomer, selectedCustomerId, customers])

  useEffect(() => {
    async function loadVehicleForEdit() {
      if (isEditingVehicle && selectedVehicleId) {
        const v = vehicles.find(v => v.id === selectedVehicleId)
        if (v) {
          setVehiclePlate(v.plate_number || '')
          setVehicleMake(v.make || '')
          setVehicleModel(v.model || '')
          setVehicleYear(v.year || '')
          setVin(v.vin || '')
          setEngineCapacity(v.engine_capacity || '')
          setVehicleTransmission(v.transmission || '')
        }
      }
    }
    loadVehicleForEdit()
  }, [isEditingVehicle, selectedVehicleId, vehicles])

  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0)
  const grandTotal = Math.max(0, subtotal - Number(discount || 0))

  const updateItem = (id: string, field: string, val: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: val }
      if (field === 'quantity' || field === 'unit_price') {
        const q = Number(updated.quantity) || 0
        const u = Number(updated.unit_price) || 0
        updated.total_price = q * u
      }
      return updated
    }))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleSave = async (status: 'DRAFT' | 'UNPAID') => {
    if (!selectedCustomerId) return setError("Customer is required")
    if (items.length === 0) return setError("Please add at least one part/material")
    
    setError(null)
    setIsSubmitting(true)

    try {
      let qsId = initialData?.id
      
      if (!qsId) {
        let nextSeq = 1
        const { data: latest } = await supabase.from('quick_sales').select('quick_sale_number').order('created_at', { ascending: false }).limit(1).maybeSingle()
        if (latest && latest.quick_sale_number) {
          const match = latest.quick_sale_number.match(/QS-(\d+)/)
          if (match) nextSeq = parseInt(match[1]) + 1
        }
        const qsNumber = `QS-${nextSeq.toString().padStart(6, '0')}`

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

      if (status === 'UNPAID' && (!initialData || initialData.status !== 'UNPAID' && initialData.status !== 'PAID')) {
        for (const item of items) {
          if (item.part_id) {
            const { data: currentPart } = await supabase.from('parts').select('stock_quantity').eq('id', item.part_id).single()
            if (currentPart) {
              await supabase.from('parts').update({ stock_quantity: Number(currentPart.stock_quantity) - Number(item.quantity) }).eq('id', item.part_id)
            }
          }
        }
        router.push(`/quick-sale/${qsId}?pay=true`)
      } else {
        router.push(`/quick-sale`)
      }
      
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  // Add Customer Handlers
  const handleCreateNewCustomer = async () => {
    try {
      const isDuplicate = await checkDuplicateCustomer(supabase, customerType, firstName, lastName, companyName)

      if (isDuplicate) {
        if (!confirm('A customer with a similar name already exists. Are you sure you want to create a duplicate?')) {
          return
        }
      }

      const builtName = buildLegacyName(customerType, firstName, lastName, companyName)
      const contactPerson = customerType === 'company' && contactFirstName ? `${contactFirstName} ${contactLastName}`.trim() : null

      const { data, error } = await saveCustomerRecord(supabase, {
        customerType,
        firstName,
        lastName,
        companyName,
        contactFirstName,
        contactLastName,
        mobile: customerMobile,
        telephone: customerTelephone,
        email: customerEmail,
        address: customerAddress,
        tin: customerTin
      })

      if (error) throw new Error(error.message)
      
      const { data: cData } = await supabase.from('customers').select('*').order('name', { ascending: true })
      if (cData) setCustomers(cData)
      setSelectedCustomerId(data.id)
      setIsAddingCustomer(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSavingVehicle(false)
    }
  }

  const handleSaveCustomerChanges = async () => {
    try {
      const builtName = buildLegacyName(customerType, firstName, lastName, companyName)
      const contactPerson = customerType === 'company' && contactFirstName ? `${contactFirstName} ${contactLastName}`.trim() : null

      const { error } = await supabase.from('customers').update({
        customer_type: customerType,
        name: builtName,
        first_name: customerType === 'individual' ? firstName : null,
        last_name: customerType === 'individual' ? lastName : null,
        contact_first_name: customerType === 'company' ? contactFirstName : null,
        contact_last_name: customerType === 'company' ? contactLastName : null,
        mobile: customerMobile,
        telephone: customerTelephone,
        email: customerEmail,
        address: customerAddress,
        tin: customerTin
      }).eq('id', selectedCustomerId)

      if (error) throw new Error(error.message)
      
      const { data: cData } = await supabase.from('customers').select('*').order('name', { ascending: true })
      if (cData) setCustomers(cData)
      setIsEditingCustomer(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSaveVehicleChanges = async () => {
    if (isSavingVehicle) return;
    setIsSavingVehicle(true);
    try {
      if (!vehiclePlate || !vehicleMake || !vehicleModel || !vehicleYear) {
        throw new Error('Please fill all required fields')
      }
      
      if (isAddingVehicle) {
        const { data, error } = await supabase.from('vehicles').insert({
          customer_id: selectedCustomerId,
          plate_number: vehiclePlate.toUpperCase(),
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
                              transmission: vehicleTransmission
        }).select().single()

        if (error) throw new Error(error.message)
        
        const { data: vData } = await supabase.from('vehicles').select('*').eq('customer_id', selectedCustomerId).order('plate_number', { ascending: true })
        if (vData) setVehicles(vData)
        setSelectedVehicleId(data.id)
        setIsAddingVehicle(false)
      } else {
        const { error } = await supabase.from('vehicles').update({
          plate_number: vehiclePlate.toUpperCase(),
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
                              transmission: vehicleTransmission
        }).eq('id', selectedVehicleId)

        if (error) throw new Error(error.message)
        
        const { data: vData } = await supabase.from('vehicles').select('*').eq('customer_id', selectedCustomerId).order('plate_number', { ascending: true })
        if (vData) setVehicles(vData)
        setIsEditingVehicle(false)
      }
    } catch (err: any) {
      alert(err.message)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Customer <span className="text-red-500">*</span></h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableCombobox
                  options={customers.map(c => ({
                    id: c.id,
                    name: formatCustomerName(c),
                    subtext: c.mobile || c.telephone || ''
                  }))}
                  value={selectedCustomerId || ""}
                  onChange={setSelectedCustomerId}
                  placeholder="Search or select customer..."
                  searchPlaceholder="Type customer name..."
                />
              </div>
              {selectedCustomerId && (
                <button type="button" onClick={() => setIsEditingCustomer(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md transition" title="Edit Customer"><Edit size={16} /></button>
              )}
              <button type="button" onClick={() => {
                setCustomerType('individual')
                setFirstName(''); setLastName(''); setCompanyName(''); setContactFirstName(''); setContactLastName(''); setCustomerMobile(''); setCustomerTelephone(''); setCustomerEmail(''); setCustomerAddress(''); setCustomerTin('');
                setIsAddingCustomer(true)
              }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition" title="Add Customer"><Plus size={16} /></button>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Vehicle (Optional)</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableCombobox
                  options={vehicles.map(v => ({
                    id: v.id,
                    name: `${v.plate_number}`,
                    subtext: `${v.make} ${v.model} ${v.year || ''}`.trim()
                  }))}
                  value={selectedVehicleId || ""}
                  onChange={setSelectedVehicleId}
                  placeholder={selectedCustomerId ? "Search or select vehicle..." : "Select customer first"}
                  searchPlaceholder="Type plate number..."
                  
                />
              </div>
              {selectedVehicleId && (
                <button type="button" onClick={() => setIsEditingVehicle(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md transition" title="Edit Vehicle"><Edit size={16} /></button>
              )}
              <button type="button" disabled={!selectedCustomerId} onClick={() => {
                setVehiclePlate(''); setVehicleMake(''); setVehicleModel(''); setVehicleYear(''); setVin(''); setEngineCapacity(''); setVehicleTransmission('');
                setIsAddingVehicle(true)
              }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition disabled:opacity-50" title="Add Vehicle"><Plus size={16} /></button>
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
          
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">₱{subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Discount</span>
              <div className="w-24 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                <input 
                  type="number" 
                  min="0" step="0.01" 
                  value={discount} 
                  onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="w-full border border-slate-300 rounded p-1 pl-6 text-right text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800 text-lg">Grand Total</span>
              <span className="font-bold text-blue-600 text-2xl">₱{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button 
          type="button" 
          onClick={() => handleSave('DRAFT')}
          disabled={isSubmitting}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-md font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <Save size={18} /> Save Draft
        </button>
        <button 
          type="button" 
          onClick={() => handleSave('UNPAID')}
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <ArrowRightCircle size={18} /> Complete Quick Sale
        </button>
      </div>

      {/* CUSTOMER MODAL */}
      {(isAddingCustomer || isEditingCustomer) && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {customerType === 'company' ? <Building2 size={18} className="text-slate-500"/> : <User size={18} className="text-slate-500"/>}
                {isAddingCustomer ? 'Add New Customer' : 'Edit Customer'}
              </h2>
              <button type="button" onClick={() => { setIsAddingCustomer(false); setIsEditingCustomer(false); }} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setCustomerType('individual')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${customerType === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Individual</button>
                <button type="button" onClick={() => setCustomerType('company')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${customerType === 'company' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Company</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {customerType === 'individual' ? (
                  <>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Juan" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Dela Cruz" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="ABC Corporation" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact First Name</label>
                      <input type="text" value={contactFirstName} onChange={e => setContactFirstName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Juan" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Last Name</label>
                      <input type="text" value={contactLastName} onChange={e => setContactLastName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Dela Cruz" />
                    </div>
                  </>
                )}

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                  <input type="text" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="09171234567" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
                  <input type="text" value={customerTelephone} onChange={e => setCustomerTelephone(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="042-123-4567" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="info@example.com" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">TIN</label>
                  <input type="text" value={customerTin} onChange={e => setCustomerTin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123-456-789-000" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-md p-2" placeholder="Complete address..."></textarea>
                </div>
              </div>
              
              {isAddingCustomer && (
                <>
                  <div className="border-t border-slate-200 mt-6 mb-4"></div>
                  <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Car size={16} className="text-slate-500"/> First Vehicle (Optional)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number <span className="text-red-500">*</span></label>
                      <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chassis Number / VIN</label>
                      <input type="text" value={vin} onChange={e => setVin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="KNCSHX..." />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Make <span className="text-red-500">*</span></label>
                      <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>
                      <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year <span className="text-red-500">*</span></label>
                      <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Engine Capacity</label>
                      <input type="text" value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2.8L" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                      <select value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
                        <option value="">Select...</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAddingCustomer(false); setIsEditingCustomer(false); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition">
                Cancel
              </button>
              <button type="button" onClick={isAddingCustomer ? handleCreateNewCustomer : handleSaveCustomerChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                {isAddingCustomer ? 'Save New Customer' : 'Save Customer Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* VEHICLE MODAL */}
      {(isAddingVehicle || isEditingVehicle) && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Car size={18} className="text-slate-500"/>
                {isAddingVehicle ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h2>
              <button type="button" onClick={() => { setIsAddingVehicle(false); setIsEditingVehicle(false); }} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
                  <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chassis Number / VIN</label>
                  <input type="text" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="KNCSHX..." />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Make <span className="text-red-500">*</span></label>
                  <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>
                  <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
                </div>
                <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year <span className="text-red-500">*</span></label>
                      <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Engine Capacity</label>
                      <input type="text" value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2.8L" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                      <select value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
                    <option value="">Select...</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAddingVehicle(false); setIsEditingVehicle(false); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition">
                Cancel
              </button>
              <button type="button" disabled={isSavingVehicle} onClick={handleSaveVehicleChanges} className="disabled:bg-blue-400 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                {isAddingVehicle ? 'Save New Vehicle' : 'Save Vehicle Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    
    </div>
  )
}
