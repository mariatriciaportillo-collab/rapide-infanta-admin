'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, ArrowLeft, Save, Search, User, Car, Building2 } from 'lucide-react'
import Link from 'next/link'
import { formatCustomerName, formatContactPerson } from '@/utils/customer'

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

  // Master Data Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([])
  
  // Customer State
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual')
  
  // Individual fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // Company fields
  const [companyName, setCompanyName] = useState('')
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  
  // Computed legacy fields (for display of selected customer)
  const [displayCustomerName, setDisplayCustomerName] = useState('')
  const [displayContactPerson, setDisplayContactPerson] = useState('')

  const [customerMobile, setCustomerMobile] = useState('')
  const [customerTelephone, setCustomerTelephone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerTin, setCustomerTin] = useState('')
  
  // Vehicle State
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleTransmission, setVehicleTransmission] = useState('')
  const [mileage, setMileage] = useState('')

  // Quote State
  const [notes, setNotes] = useState('')
  const [warranty, setWarranty] = useState('3 Months / 5,000km (Whichever comes first)')
  const [preparedBy, setPreparedBy] = useState('Rapide Infanta Admin')
  const [discount, setDiscount] = useState<number>(0)

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: '', is_section_header: false }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search Customers
  useEffect(() => {
    const search = async () => {
      if (customerSearch.trim().length < 2) {
        setSearchResults([])
        return
      }
      
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${customerSearch}%,first_name.ilike.%${customerSearch}%,last_name.ilike.%${customerSearch}%,contact_person.ilike.%${customerSearch}%,contact_first_name.ilike.%${customerSearch}%,contact_last_name.ilike.%${customerSearch}%,mobile.ilike.%${customerSearch}%`)
        .limit(5)
        
      setSearchResults(data || [])
    }
    
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [customerSearch, supabase])

  // Select Customer
  const handleSelectCustomer = async (customer: any) => {
    setSelectedCustomerId(customer.id)
    setCustomerType(customer.customer_type as 'individual' | 'company' || 'individual')
    
    setDisplayCustomerName(formatCustomerName(customer))
    setDisplayContactPerson(formatContactPerson(customer))
    
    // Fill the actual raw fields in case they want to see them (though inputs are disabled)
    setFirstName(customer.first_name || '')
    setLastName(customer.last_name || '')
    setCompanyName(customer.name || '')
    setContactFirstName(customer.contact_first_name || '')
    setContactLastName(customer.contact_last_name || '')
    
    setCustomerMobile(customer.mobile || '')
    setCustomerTelephone(customer.telephone || '')
    setCustomerEmail(customer.email || '')
    setCustomerAddress(customer.address || '')
    setCustomerTin(customer.tin || '')
    
    setCustomerSearch('')
    setShowDropdown(false)

    // Fetch their vehicles
    const { data: v } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customer.id)
    
    setCustomerVehicles(v || [])
    if (v && v.length === 1) {
      handleSelectVehicle(v[0])
    } else {
      setSelectedVehicleId(null)
      setVehiclePlate('')
      setVehicleMake('')
      setVehicleModel('')
      setVehicleYear('')
      setVehicleTransmission('')
    }
  }

  // Select Vehicle
  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicleId(vehicle.id)
    setVehiclePlate(vehicle.plate_number)
    setVehicleMake(vehicle.make || '')
    setVehicleModel(vehicle.model || '')
    setVehicleYear(vehicle.year ? vehicle.year.toString() : '')
    setVehicleTransmission(vehicle.transmission || '')
  }

  // Clear Customer
  const handleClearCustomer = () => {
    setSelectedCustomerId(null)
    setSelectedVehicleId(null)
    setCustomerVehicles([])
    setCustomerType('individual')
    
    setFirstName('')
    setLastName('')
    setCompanyName('')
    setContactFirstName('')
    setContactLastName('')
    setDisplayCustomerName('')
    setDisplayContactPerson('')
    
    setCustomerMobile('')
    setCustomerTelephone('')
    setCustomerEmail('')
    setCustomerAddress('')
    setCustomerTin('')
    
    setVehiclePlate('')
    setVehicleMake('')
    setVehicleModel('')
    setVehicleYear('')
    setVehicleTransmission('')
  }

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

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompanyName = companyName.trim()
    const cleanContactFirst = contactFirstName.trim()
    const cleanContactLast = contactLastName.trim()

    if (!selectedCustomerId) {
      if (customerType === 'individual') {
        if (!cleanFirstName || !cleanLastName) {
          setError("First Name and Last Name are required.")
          setIsSubmitting(false)
          return
        }
      } else {
        if (!cleanCompanyName) {
          setError("Company Name is required.")
          setIsSubmitting(false)
          return
        }
      }
    }

    if (!vehiclePlate.trim()) {
      setError("Vehicle Plate Number is required.")
      setIsSubmitting(false)
      return
    }

    try {
      let finalCustomerId = selectedCustomerId
      let finalDisplayName = displayCustomerName
      let finalContactPerson = displayContactPerson
      
      // Auto-create customer if none selected
      if (!finalCustomerId) {
        const { data: newCust, error: custErr } = await supabase.from('customers').insert({
          customer_type: customerType,
          name: customerType === 'company' ? cleanCompanyName : null,
          first_name: customerType === 'individual' ? cleanFirstName : null,
          last_name: customerType === 'individual' ? cleanLastName : null,
          contact_first_name: customerType === 'company' ? cleanContactFirst : null,
          contact_last_name: customerType === 'company' ? cleanContactLast : null,
          mobile: customerMobile,
          telephone: customerType === 'company' ? customerTelephone : null,
          email: customerEmail,
          address: customerAddress,
          tin: customerType === 'company' ? customerTin : null
        }).select().single()
        
        if (custErr) throw custErr
        if (newCust) {
          finalCustomerId = newCust.id
          finalDisplayName = formatCustomerName(newCust)
          finalContactPerson = formatContactPerson(newCust)
        }
      }
      
      let finalVehicleId = selectedVehicleId
      
      // Auto-create vehicle if none selected
      if (!finalVehicleId && finalCustomerId) {
        const { data: newVeh, error: vehErr } = await supabase.from('vehicles').insert({
          customer_id: finalCustomerId,
          plate_number: vehiclePlate.toUpperCase(),
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear ? parseInt(vehicleYear) : null,
          transmission: vehicleTransmission
        }).select().single()
        
        if (vehErr) throw vehErr
        if (newVeh) finalVehicleId = newVeh.id
      }

      // 1. Generate Quote Number
      const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const randomPart = Math.floor(1000 + Math.random() * 9000)
      const quoteNumber = `INFANTA-${datePart}-${randomPart}`

      // 2. Insert Quotation
      const { data: quote, error: quoteError } = await supabase
        .from('quotations')
        .insert({
          quote_number: quoteNumber,
          customer_id: finalCustomerId,
          vehicle_id: finalVehicleId,
          // Snapshots (combined formatted names to keep quotation table simple)
          customer_type: customerType,
          customer_name: finalDisplayName, 
          contact_person: customerType === 'company' ? finalContactPerson : null,
          customer_email: customerEmail,
          customer_telephone: customerType === 'company' ? customerTelephone : null,
          customer_tin: customerType === 'company' ? customerTin : null,
          customer_address: customerAddress,
          vehicle_plate: vehiclePlate.toUpperCase(), 
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
        .filter(i => i.description.trim() !== '')
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

      {/* SEARCH BAR */}
      {!selectedCustomerId && (
        <div className="mb-6 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search existing customer or company..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((cust) => {
                const searchDisplayName = formatCustomerName(cust)
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleSelectCustomer(cust)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{searchDisplayName}</div>
                      <div className="text-sm text-slate-500 capitalize">{cust.customer_type} • {cust.mobile || cust.telephone || 'No contact number'}</div>
                    </div>
                    {cust.customer_type === 'company' ? <Building2 size={18} className="text-slate-400" /> : <User size={18} className="text-slate-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              {customerType === 'company' ? <Building2 size={18} className="text-slate-500"/> : <User size={18} className="text-slate-500"/>}
              {customerType === 'company' ? 'Company' : 'Customer'} Information
            </h3>
            {selectedCustomerId && (
              <button type="button" onClick={handleClearCustomer} className="text-xs text-red-500 hover:underline">
                Clear & Enter New
              </button>
            )}
          </div>
          
          {!selectedCustomerId && (
            <div className="mb-4 flex gap-2">
              <button type="button" onClick={() => setCustomerType('individual')} className={`px-3 py-1 rounded text-sm font-medium ${customerType === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>Individual</button>
              <button type="button" onClick={() => setCustomerType('company')} className={`px-3 py-1 rounded text-sm font-medium ${customerType === 'company' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>Company</button>
            </div>
          )}
          
          <div className="space-y-4">
            
            {selectedCustomerId ? (
              // READONLY MODE FOR SELECTED CUSTOMER
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{customerType === 'company' ? 'Company Name' : 'Full Name'}</label>
                  <input type="text" value={displayCustomerName} className="w-full border border-slate-300 rounded-md p-2 font-medium bg-slate-50" disabled />
                </div>
                {customerType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                    <input type="text" value={displayContactPerson} className="w-full border border-slate-300 rounded-md p-2 bg-slate-50" disabled />
                  </div>
                )}
              </>
            ) : (
              // NEW CUSTOMER INPUT MODE
              customerType === 'individual' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                    <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="Juan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                    <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="Dela Cruz" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                    <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="ABC Construction Corp" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact First Name</label>
                      <input type="text" value={contactFirstName} onChange={e => setContactFirstName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Maria" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Last Name</label>
                      <input type="text" value={contactLastName} onChange={e => setContactLastName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Santos" />
                    </div>
                  </div>
                </>
              )
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                <input type="text" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="09171234567" disabled={!!selectedCustomerId} />
              </div>
              
              {customerType === 'company' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
                  <input type="text" value={customerTelephone} onChange={e => setCustomerTelephone(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="042-123-4567" disabled={!!selectedCustomerId} />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="juan@example.com" disabled={!!selectedCustomerId} />
                </div>
              )}
            </div>

            {customerType === 'company' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="info@abccorp.com" disabled={!!selectedCustomerId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TIN</label>
                  <input type="text" value={customerTin} onChange={e => setCustomerTin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123-456-789-000" disabled={!!selectedCustomerId} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123 Main St, Infanta" disabled={!!selectedCustomerId} />
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800">Vehicle Information</h3>
            {selectedVehicleId && (
              <button type="button" onClick={() => {
                setSelectedVehicleId(null)
                setVehiclePlate('')
                setVehicleMake('')
                setVehicleModel('')
                setVehicleYear('')
                setVehicleTransmission('')
              }} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add New
              </button>
            )}
          </div>

          {!selectedVehicleId && customerVehicles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select from Fleet</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {customerVehicles.map(v => (
                  <button 
                    key={v.id} 
                    type="button" 
                    onClick={() => handleSelectVehicle(v)}
                    className="flex justify-between items-center p-3 border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition text-left"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{v.plate_number}</div>
                      <div className="text-sm text-slate-500">{v.make} {v.model} {v.year}</div>
                    </div>
                    <Car size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>
              <div className="my-4 text-center text-sm font-medium text-slate-400 uppercase tracking-widest border-b border-slate-200 leading-[0.1em]">
                <span className="bg-white px-3">OR ENTER NEW</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
              <input required type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase font-bold" placeholder="ABC 1234" disabled={!!selectedVehicleId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" disabled={!!selectedVehicleId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" disabled={!!selectedVehicleId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input type="number" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2018" disabled={!!selectedVehicleId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
              <select value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" disabled={!!selectedVehicleId}>
                <option value="">Select...</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
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
