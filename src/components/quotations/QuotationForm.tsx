'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, ArrowLeft, Save, Search, User, Car, Building2, Edit, X } from 'lucide-react'
import Link from 'next/link'
import { formatCustomerName, formatContactPerson, buildLegacyName } from '@/utils/customer'
import { MakeModelSelector } from '@/components/vehicles/MakeModelSelector'
import { YearSelector } from '@/components/vehicles/YearSelector'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'
import { NewLaborModal } from '@/components/quotations/NewLaborModal'
import { PackageResolveModal } from '@/components/quotations/PackageResolveModal'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

type LineItem = {
  id: string
  description: string
  quantity: number | ''
  unit_price: number | ''
  is_section_header: boolean
  
  item_type?: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM'
  package_id?: string | null
  parent_item_id?: string | null
  is_category?: boolean
  part_category_id?: string | null
  resolved_part_id?: string | null
  part_id?: string | null
  
  package_items?: LineItem[] // Nested items for a package
  
  labor_service_id?: string | null
  group_id?: string | null
  category_id?: string | null
  group_name_snapshot?: string | null
  category_name_snapshot?: string | null
  standard_hour_snapshot?: number | null
  
  // For UI display
  resolved_part_name?: string | null
  internal_price_snapshot?: number
  internal_amount_snapshot?: number
}


const formatVehicleName = (v: any) => {
  if (!v) return '';
  const make = v.make || '';
  const model = v.model || '';
  const year = v.year ? ` ${v.year}` : '';
  const plate = v.plate_number || '';
  
  const base = `${make} ${model}${year}`.trim();
  if (base && plate) return `${base.toUpperCase()} — ${plate.toUpperCase()}`;
  if (plate) return plate.toUpperCase();
  return base.toUpperCase();
}

export function QuotationForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()

  // Master Data Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const vehicleSearchRef = useRef<HTMLDivElement>(null)
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
  const [vin, setVin] = useState('')
  const [engineCapacity, setEngineCapacity] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleTransmission, setVehicleTransmission] = useState('')
  const [mileage, setMileage] = useState('')

  // Quote State
  const [notes, setNotes] = useState('')
  const [warranty, setWarranty] = useState('3 Months / 5,000km (Whichever comes first)')
  const [preparedBy, setPreparedBy] = useState('')
  const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')
  const [mechanicId, setMechanicId] = useState<string>(initialData?.mechanic_id || '')
  const [mechanics, setMechanics] = useState<any[]>([])
  const [advisors, setAdvisors] = useState<any[]>([])
  const [discount, setDiscount] = useState<number>(0)

  const [items, setItems] = useState<LineItem[]>([])

  // Labor Services for Combobox
  const [laborServices, setLaborServices] = useState<any[]>([])
  
  // Packages for Combobox
  const [packages, setPackages] = useState<any[]>([])
  
  // Resolve Part Modal State
  const [isResolvePartModalOpen, setIsResolvePartModalOpen] = useState(false)
  const [pendingPackage, setPendingPackage] = useState<any>(null)

  
  // Modal State
  const [isNewLaborModalOpen, setIsNewLaborModalOpen] = useState(false)
  const [newLaborSearchQuery, setNewLaborSearchQuery] = useState('')
  const [activeItemIndexForModal, setActiveItemIndexForModal] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditingQuote = !!initialData


  // Inline Edit State
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)

  // Load initialData
  useEffect(() => {
    if (initialData) {
      setSelectedCustomerId(initialData.customer_id)
      setSelectedVehicleId(initialData.vehicle_id || null)
      setNotes(initialData.notes || '')
      setWarranty(initialData.warranty_terms || '')
      setPreparedBy(initialData.prepared_by || '')
      setDiscount(initialData.discount_amount || 0)
      
      // Reload Customer Details
      setCustomerType(initialData.customer_type || 'individual')
      setCustomerMobile(initialData.customer_telephone || '')
      setCustomerTelephone(initialData.customer_telephone || '')
      setCustomerEmail(initialData.customer_email || '')
      setCustomerAddress(initialData.customer_address || '')
      setCustomerTin(initialData.customer_tin || '')
      
      // Reload Vehicle Details
      setVehiclePlate(initialData.vehicle_plate || '')
      setVehicleMake(initialData.vehicle_make || '')
      setVehicleModel(initialData.vehicle_model || '')
      setVehicleYear(initialData.vehicle_year || '')
      setEngineCapacity(initialData.engine_capacity || '')
      setVin(initialData.vin || '')
      
      // Reload Service Details
      setMileage(initialData.mileage_km ? String(initialData.mileage_km) : '')
      
      if (initialData.vehicles) {
        const v = initialData.vehicles;
        setVehicleSearch(v.plate_number + (v.make ? ' - ' + v.make : '') + (v.model ? ' ' + v.model : ''));
      }
      
      if (initialData.customers) {
        setDisplayCustomerName(formatCustomerName(initialData.customers))
        setDisplayContactPerson(formatContactPerson(initialData.customers))
        setCustomerSearch(formatCustomerName(initialData.customers))
      }

      if (initialData.quotation_items) {
        const sortedItems = [...initialData.quotation_items].sort((a, b) => a.sort_order - b.sort_order)
        const flatItems: LineItem[] = sortedItems.map(item => ({
          id: item.id,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          is_section_header: item.is_section_header,
          item_type: item.item_type || 'MANUAL',
          package_id: item.package_id,
          parent_item_id: item.parent_item_id,
          labor_service_id: item.labor_service_id,
          part_id: item.part_id,
          is_category: item.is_category,
          part_category_id: item.part_category_id,
          resolved_part_id: item.resolved_part_id,
          internal_price_snapshot: item.internal_price_snapshot,
          internal_amount_snapshot: item.internal_amount_snapshot,
          group_id: item.group_id,
          category_id: item.category_id,
          group_name_snapshot: item.group_name_snapshot,
          category_name_snapshot: item.category_name_snapshot,
          standard_hour_snapshot: item.standard_hour_snapshot
        }))
        setItems(flatItems)
      }
    }
  }, [initialData])


  // Fetch labor services on mount
  useEffect(() => {
    const fetchLabor = async () => {
      const { data } = await supabase
        .from('labor_services')
        .select('*, labor_groups(name), labor_categories(name)')
        .eq('is_active', true)
      if (data) setLaborServices(data)
    }
    
    const fetchAdvisors = async () => {
      // 1. Fetch active service advisors
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .in('status', ['Active', 'ACTIVE']);
        
      let activeAdvisors: any[] = [];
      if (data) {
        activeAdvisors = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => r.toUpperCase() === 'SERVICE ADVISOR')
        );
      }
      
      // 2. If editing and there is a selected advisor, ensure they are in the list even if inactive
      if (initialData?.service_advisor_id) {
        const isAlreadyInList = activeAdvisors.some(a => a.id === initialData.service_advisor_id);
        if (!isAlreadyInList) {
          const { data: historicalAdvisor } = await supabase.from('employees')
            .select('id, full_name, roles, status')
            .eq('id', initialData.service_advisor_id)
            .single();
            
          if (historicalAdvisor) {
            activeAdvisors.push(historicalAdvisor);
          }
        }
      }
      
      setAdvisors(activeAdvisors);
      
      let activeMechanics: any[] = [];
      if (data) {
        activeMechanics = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => {
            const role = r.toUpperCase();
            return role === 'MECHANIC / TECHNICIAN' || role === 'SENIOR MECHANIC' || role === 'MECHANIC';
          })
        );
      }
      
      if (initialData?.mechanic_id) {
        const isAlreadyInList = activeMechanics.some(m => m.id === initialData.mechanic_id);
        if (!isAlreadyInList) {
          const { data: historicalMechanic } = await supabase.from('employees')
            .select('id, full_name, roles, status')
            .eq('id', initialData.mechanic_id)
            .single();
            
          if (historicalMechanic) {
            activeMechanics.push(historicalMechanic);
          }
        }
      }
      setMechanics(activeMechanics);
    }
    fetchAdvisors()
    
    const fetchPackages = async () => {
      const { data } = await supabase
        .from('packages')
        .select('*, package_items(*, labor_services(*), parts(*), part_categories(*))')
        .eq('is_active', true)
      if (data) setPackages(data)
    }

    fetchLabor()
    fetchPackages()
  }, [supabase])

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (vehicleSearchRef.current && !vehicleSearchRef.current.contains(event.target as Node)) {
        setShowVehicleDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search Customers
  useEffect(() => {
    const search = async () => {
      let customerPromise;
      let vehiclePromise;

      if (customerSearch.trim().length === 0) {
        customerPromise = supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        vehiclePromise = Promise.resolve({ data: [] });
      } else {
        customerPromise = supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.%${customerSearch}%,first_name.ilike.%${customerSearch}%,last_name.ilike.%${customerSearch}%,contact_person.ilike.%${customerSearch}%,contact_first_name.ilike.%${customerSearch}%,contact_last_name.ilike.%${customerSearch}%,mobile.ilike.%${customerSearch}%`)
          .limit(20)

        vehiclePromise = supabase
          .from('vehicles')
          .select('*, customers(*)')
          .ilike('plate_number', `%${customerSearch}%`)
          .limit(10)
      }

      const [custRes, vehRes] = await Promise.all([customerPromise, vehiclePromise])
      
      const combined = new Map()
      if (custRes.data) {
        custRes.data.forEach(c => combined.set(c.id, c))
      }
      
      if (vehRes.data) {
        vehRes.data.forEach(v => {
          if (v.customers) {
            const existing = combined.get(v.customers.id)
            if (existing) {
              combined.set(v.customers.id, { ...existing, matched_vehicle: v })
            } else {
              combined.set(v.customers.id, { ...v.customers, matched_vehicle: v })
            }
          }
        })
      }
        
      setSearchResults(Array.from(combined.values()).slice(0, 50))
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
    
    setCustomerSearch(formatCustomerName(customer))
    setShowDropdown(false)
    setIsEditingCustomer(false) // reset state just in case

    // Fetch their vehicles
    const { data: v } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customer.id)
    
    setCustomerVehicles(v || [])
    if (customer.matched_vehicle) {
      handleSelectVehicle(customer.matched_vehicle)
    } else if (v && v.length === 1) {
      handleSelectVehicle(v[0])
    } else {
      setSelectedVehicleId(null)
      setVehiclePlate('')
    setVin('')
    setEngineCapacity('')
    setVehicleMake('')
      setVehicleModel('')
      setVehicleYear('')
      setVehicleTransmission('')
      setMileage('')
      setVehicleSearch('')
    }
  }

    const handleCreateNewCustomer = async () => {
    setError(null)
    
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompanyName = companyName.trim()
    
    if (customerType === 'individual' && (!cleanFirstName || !cleanLastName)) {
      setError("First Name and Last Name are required.")
      return
    }
    if (customerType === 'company' && !cleanCompanyName) {
      setError("Company Name is required.")
      return
    }

    const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
    if (!normalizedPlate && (vehicleMake || vehicleModel || vehicleYear)) {
      setError("Plate Number is required to create the vehicle.")
      return
    }

    const payload = {
      customer_type: customerType,
      name: buildLegacyName(customerType, cleanFirstName, cleanLastName, cleanCompanyName),
      first_name: customerType === 'individual' ? cleanFirstName : null,
      last_name: customerType === 'individual' ? cleanLastName : null,
      contact_person: customerType === 'company' ? buildLegacyName('individual', contactFirstName.trim(), contactLastName.trim(), '') : null,
      contact_first_name: customerType === 'company' ? contactFirstName.trim() : null,
      contact_last_name: customerType === 'company' ? contactLastName.trim() : null,
      mobile: customerMobile || null,
      telephone: customerTelephone || null,
      email: customerEmail || null,
      address: customerAddress || null,
      tin: customerTin || null
    }
    
    const { data: newCust, error: custErr } = await supabase.from('customers').insert([payload]).select().single()
    
    if (custErr) {
      setError(`Failed to create customer: ${custErr.message}`)
      return
    }
    
    let newVeh = null;
    if (normalizedPlate) {
      const vPayload = {
        customer_id: newCust.id,
        plate_number: normalizedPlate,
        vin: vin.trim() || null,
        engine_capacity: engineCapacity.trim() || null,
        make: vehicleMake || null,
        model: vehicleModel || null,
        year: vehicleYear ? parseInt(vehicleYear) : null,
        transmission: vehicleTransmission || null
      }
      const { data: vData, error: vErr } = await supabase.from('vehicles').insert([vPayload]).select().single()
      if (vErr) {
        // Still proceed, just log error for vehicle
        console.error("Failed to create vehicle:", vErr)
      } else {
        newVeh = vData;
      }
    }
    
    await handleSelectCustomer(newCust)
    if (newVeh) {
      handleSelectVehicle(newVeh)
    }
    
    setIsAddingCustomer(false)
  }

  const handleSaveCustomerChanges = async () => {
    if (!selectedCustomerId) return
    setError(null)
    
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompanyName = companyName.trim()
    
    if (customerType === 'individual' && (!cleanFirstName || !cleanLastName)) {
      setError("First Name and Last Name are required.")
      return
    }
    if (customerType === 'company' && !cleanCompanyName) {
      setError("Company Name is required.")
      return
    }

    const payload = {
      customer_type: customerType,
      name: buildLegacyName(customerType, cleanFirstName, cleanLastName, cleanCompanyName),
      first_name: customerType === 'individual' ? cleanFirstName : null,
      last_name: customerType === 'individual' ? cleanLastName : null,
      contact_first_name: customerType === 'company' ? contactFirstName.trim() : null,
      contact_last_name: customerType === 'company' ? contactLastName.trim() : null,
      mobile: customerMobile,
      telephone: customerType === 'company' ? customerTelephone : null,
      email: customerEmail,
      address: customerAddress,
      tin: customerType === 'company' ? customerTin : null
    }

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', selectedCustomerId)
      .select()
      .single()
      
    if (error) {
      setError(`Failed to update customer: ${error.message}`)
      return
    }
    
    // Update display names without changing quotation items or other state
    setDisplayCustomerName(formatCustomerName(data))
    setDisplayContactPerson(formatContactPerson(data))
    
    // Also update it in searchResults so Cancel logic works next time
    setSearchResults(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c))
    setIsEditingCustomer(false)
  }

  // Select Vehicle
  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicleId(vehicle.id)
    setVehiclePlate(vehicle.plate_number)
    setVin(vehicle.vin || '')
    setEngineCapacity(vehicle.engine_capacity || '')
    setVehicleMake(vehicle.make || '')
    setVehicleModel(vehicle.model || '')
    setVehicleYear(vehicle.year ? vehicle.year.toString() : '')
    setVehicleTransmission(vehicle.transmission || '')
    setVehicleSearch(formatVehicleName(vehicle))
    setShowVehicleDropdown(false)
  }

  const handleSaveVehicleChanges = async () => {
    if (!selectedCustomerId) return
    setError(null)

    const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
    if (!normalizedPlate) {
      setError("Plate Number is required.")
      return
    }

    // Check duplicate
    let query = supabase.from('vehicles').select('id, plate_number, customers(name, first_name, last_name)').ilike('plate_number', `%${normalizedPlate}%`)
    if (isEditingVehicle && selectedVehicleId) {
      query = query.neq('id', selectedVehicleId)
    }
    const { data: existingVeh } = await query.maybeSingle()

    if (existingVeh) {
      const owner = Array.isArray(existingVeh.customers) ? existingVeh.customers[0] : existingVeh.customers
      const ownerName = owner?.name || `${owner?.first_name || ''} ${owner?.last_name || ''}`.trim() || 'another customer'
      setError(`Vehicle with plate ${vehiclePlate} already exists under ${ownerName}.`)
      return
    }

    const payload = {
      customer_id: selectedCustomerId, // Make sure it stays linked
      plate_number: vehiclePlate.toUpperCase(),
      vin: vin.trim() || null,
      engine_capacity: engineCapacity.trim() || null,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear ? parseInt(vehicleYear) : null,
      transmission: vehicleTransmission
    }

    if (isAddingVehicle) {
      const { data: newVeh, error } = await supabase.from('vehicles').insert(payload).select().single()
      if (error) {
        setError(`Failed to add vehicle: ${error.message}`)
        return
      }
      setCustomerVehicles(prev => [...prev, newVeh])
      handleSelectVehicle(newVeh)
      setIsAddingVehicle(false)
    } else if (isEditingVehicle && selectedVehicleId) {
      const { data: updatedVeh, error } = await supabase.from('vehicles').update(payload).eq('id', selectedVehicleId).select().single()
      if (error) {
        setError(`Failed to update vehicle: ${error.message}`)
        return
      }
      setCustomerVehicles(prev => prev.map(v => v.id === updatedVeh.id ? updatedVeh : v))
      handleSelectVehicle(updatedVeh)
      setIsEditingVehicle(false)
    }
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
    setCustomerSearch('')
    setIsAddingCustomer(false)
    setIsEditingCustomer(false)
    
    setVehiclePlate('')
    setVin('')
    setEngineCapacity('')
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

    const addPackageToItems = (pkg: any, resolvedParts: Record<string, any> = {}) => {
    const headerId = crypto.randomUUID()
    const newItem: LineItem = {
      id: headerId,
      item_type: 'PACKAGE',
      package_id: pkg.id,
      description: pkg.name,
      quantity: 1,
      unit_price: pkg.package_price,
      is_section_header: false,
    }
    
    const childItems: LineItem[] = (pkg.package_items || []).map((pi: any) => {
      const resolved = resolvedParts[pi.id]
      return {
        id: crypto.randomUUID(),
        item_type: 'PACKAGE_ITEM',
        parent_item_id: headerId,
        description: pi.item_type === 'LABOR' 
          ? (pi.labor_services?.name || 'Unknown Labor') 
          : (pi.is_category ? (resolved?.name || pi.part_categories?.name || 'Unknown Category') : (pi.parts?.name || 'Unknown Part')),
        quantity: pi.quantity,
        unit_price: 0,
        is_section_header: false,
        labor_service_id: pi.labor_service_id,
        part_id: resolved ? resolved.id : pi.part_id,
        is_category: pi.is_category,
        part_category_id: pi.part_category_id,
        resolved_part_id: resolved ? resolved.id : null,
        resolved_part_name: resolved ? resolved.name : null,
        internal_price_snapshot: pi.price,
        internal_amount_snapshot: Number(pi.price) * Number(pi.quantity)
      }
    })
    
    setItems(prev => [...prev, newItem, ...childItems])
    setPendingPackage(null)
  }

  const addItem = (isHeader: boolean, type: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM' = 'MANUAL') => {
    setItems([
      ...items, 
      { 
        id: crypto.randomUUID(), 
        description: '', 
        quantity: isHeader ? '' : 1, 
        unit_price: isHeader ? '' : '', 
        is_section_header: isHeader 
      }
    ])
  }

  const removeItem = (id: string) => {
    // If we are removing a package (or any item that might act as a parent), 
    // we should also remove any child items (PACKAGE_ITEM) that belong to it.
    setItems(items.filter(i => i.id !== id && i.parent_item_id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const updateItemBulk = (id: string, updates: Partial<LineItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (isEditingCustomer) {
      setError("Please save or cancel your Customer changes before saving the quotation.")
      setIsSubmitting(false)
      return
    }
    if (isEditingVehicle || isAddingVehicle) {
      setError("Please save or cancel your Vehicle changes before saving the quotation.")
      setIsSubmitting(false)
      return
    }

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

    const validItems = items.filter(i => i.description.trim() !== '' || i.labor_service_id)
    if (validItems.length === 0) {
      setError("Please add at least one line item.")
      setIsSubmitting(false)
      return
    }

    for (const item of validItems) {
      if (!item.is_section_header) {
        if (!item.description?.trim() && !item.labor_service_id) {
          setError("Description is required for all non-header items.")
          setIsSubmitting(false)
          return
        }
        if (item.unit_price === '' || item.unit_price === null || item.unit_price === undefined) {
          setError(`Unit Price is required for item: ${item.description || 'Unnamed item'}`)
          setIsSubmitting(false)
          return
        }
        if (Number(item.quantity) <= 0) {
          setError(`Quantity must be greater than 0 for item: ${item.description || 'Unnamed item'}`)
          setIsSubmitting(false)
          return
        }
      }
    }

    try {

      let finalCustomerId = selectedCustomerId
      let finalDisplayName = displayCustomerName
      let finalContactPerson = displayContactPerson
      
      // Auto-create customer if none selected
      if (!finalCustomerId) {
        // Duplicate check for mobile
        if (customerMobile.trim()) {
          const { data: existingCust } = await supabase
            .from('customers')
            .select('id, first_name, last_name, name')
            .eq('mobile', customerMobile.trim())
            .single()
            
          if (existingCust) {
            setError(`A customer with this mobile number already exists (${existingCust.name || existingCust.first_name + ' ' + existingCust.last_name}). Please search and select them instead.`)
            setIsSubmitting(false)
            return
          }
        }

        const customerPayload = {
          customer_type: customerType,
          name: buildLegacyName(customerType, cleanFirstName, cleanLastName, cleanCompanyName),
          first_name: customerType === 'individual' ? cleanFirstName : null,
          last_name: customerType === 'individual' ? cleanLastName : null,
          contact_first_name: customerType === 'company' ? cleanContactFirst : null,
          contact_last_name: customerType === 'company' ? cleanContactLast : null,
          mobile: customerMobile,
          telephone: customerType === 'company' ? customerTelephone : null,
          email: customerEmail,
          address: customerAddress,
          tin: customerType === 'company' ? customerTin : null
        };

        const { data: newCust, error: custErr } = await supabase.from('customers').insert(customerPayload).select().single()
        
        if (custErr) {
          console.error("[QUOTATION SAVE] Step 2 FAILED (Customer)", JSON.stringify(custErr, null, 2));
          throw new Error(`Customer Save Failed: ${custErr.message} (${custErr.code})`);
        }
        if (newCust) {
          finalCustomerId = newCust.id
          finalDisplayName = formatCustomerName(newCust)
          finalContactPerson = formatContactPerson(newCust)
        }
      } else {
      }
      
      let finalVehicleId = selectedVehicleId
      
      // Auto-create vehicle if none selected
      if (!finalVehicleId && finalCustomerId) {
        const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
        
        // Check if plate already exists
        const { data: existingVeh } = await supabase
          .from('vehicles')
          .select('id, plate_number, customers(name, first_name, last_name)')
          .ilike('plate_number', `%${normalizedPlate}%`)
          .single()
          
        if (existingVeh) {
          const owner = Array.isArray(existingVeh.customers) ? existingVeh.customers[0] : existingVeh.customers
          const ownerName = owner?.name || `${owner?.first_name || ''} ${owner?.last_name || ''}`.trim() || 'another customer'
          setError(`Vehicle with plate ${vehiclePlate} already exists under ${ownerName}. Please search and select it instead.`)
          setIsSubmitting(false)
          return
        }

        const vehiclePayload = {
          customer_id: finalCustomerId,
          plate_number: vehiclePlate.toUpperCase(),
      vin: vin.trim() || null,
      engine_capacity: engineCapacity.trim() || null,
      make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear ? parseInt(vehicleYear) : null,
          transmission: vehicleTransmission
        };

        const { data: newVeh, error: vehErr } = await supabase.from('vehicles').insert(vehiclePayload).select().single()
        
        if (vehErr) {
          console.error("[QUOTATION SAVE] Step 3 FAILED (Vehicle)", JSON.stringify(vehErr, null, 2));
          throw new Error(`Vehicle Save Failed: ${vehErr.message} (${vehErr.code})`);
        }
        if (newVeh) finalVehicleId = newVeh.id
      } else {
      }

      // 1. Generate Quote Number (only if new)
      let quoteNumber = initialData?.quote_number;
      if (!isEditingQuote) {
        let nextNumber = 1;
        const { data: latestQuote } = await supabase
          .from('quotations')
          .select('quote_number')
          .ilike('quote_number', 'INF-%')
          .order('quote_number', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (latestQuote && latestQuote.quote_number) {
          const match = latestQuote.quote_number.match(/INF-(\d+)/);
          if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        quoteNumber = `INF-${nextNumber.toString().padStart(5, '0')}`;
      }
      
      console.log("[QUOTATION SAVE] Step 4: Saving quotation header...");
      const quotePayload = {
          quote_number: quoteNumber,
          customer_id: finalCustomerId,
          vehicle_id: finalVehicleId,
          customer_type: customerType,
          customer_name: finalDisplayName, 
          contact_person: customerType === 'company' ? finalContactPerson : null,
          customer_email: customerEmail,
          customer_telephone: customerType === 'company' ? (customerMobile || customerTelephone) : customerMobile,
          customer_tin: customerType === 'company' ? customerTin : null,
          customer_address: customerAddress,
          vehicle_plate: vehiclePlate.toUpperCase(), 
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
          mileage_km: mileage ? parseFloat(mileage) : null,
          status: initialData?.status || 'draft',
          prepared_by: preparedBy,
          service_advisor_id: serviceAdvisorId || null,
          mechanic_id: mechanicId || null,
          service_advisor_name: advisors.find(a => a.id === serviceAdvisorId)?.full_name || null,
          mechanic_name: mechanics.find(m => m.id === mechanicId)?.full_name || null,
          notes: notes,
          warranty_terms: warranty,
          subtotal: subtotal,
          discount_amount: Number(discount) || 0,
          grand_total: grandTotal
      };

      // 2. Save Quotation
      let quote = null;
      if (isEditingQuote) {
        const { data: updatedQuote, error: quoteError } = await supabase
          .from('quotations')
          .update(quotePayload)
          .eq('id', initialData.id)
          .select()
          .single()
        
        if (quoteError) throw new Error(`Quotation Header Update Failed: ${quoteError.message}`);
        quote = updatedQuote;
        
        // We will delete removed items AFTER upserting the new/updated ones.
      } else {
        const { data: newQuote, error: quoteError } = await supabase
          .from('quotations')
          .insert(quotePayload)
          .select()
          .single()
          
        if (quoteError) throw new Error(`Quotation Header Save Failed: ${quoteError.message}`);
        quote = newQuote;
      }



      // 3. Prepare Line Items
      // Generate fresh IDs for this specific save attempt to prevent 23505 on retries
      const existingDbIds = new Set((initialData?.quotation_items || []).map((i: any) => i.id));
      const idMap = new Map<string, string>();
      
      items.forEach(item => {
        if (existingDbIds.has(item.id)) {
          idMap.set(item.id, item.id);
        } else {
          idMap.set(item.id, crypto.randomUUID());
        }
      });

      const itemsToInsert = items
        .filter(i => (i.description && i.description.trim() !== '') || i.labor_service_id || i.part_id || i.package_id || i.is_category)
        .map((item, index) => ({
          // IMPORTANT: Include id so parent_item_id references map correctly if generating new UI UUIDs!
          id: idMap.get(item.id) as string,
          quotation_id: quote.id,
          sort_order: index,
          item_type: item.item_type || (item.package_id && !item.parent_item_id ? 'PACKAGE' : 'MANUAL'),
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header,
          labor_service_id: item.labor_service_id || null,
          package_id: item.package_id || null,
          parent_item_id: item.parent_item_id ? idMap.get(item.parent_item_id) : null,
          part_id: item.part_id || null,
          is_category: item.is_category || false,
          part_category_id: item.part_category_id || null,
          resolved_part_id: item.resolved_part_id || null,
          internal_price_snapshot: item.internal_price_snapshot || 0,
          internal_amount_snapshot: item.internal_amount_snapshot || 0,
          group_id: item.group_id || null,
          category_id: item.category_id || null,
          group_name_snapshot: item.group_name_snapshot || null,
          category_name_snapshot: item.category_name_snapshot || null,
          standard_hour_snapshot: item.standard_hour_snapshot || null
        }))


      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('quotation_items')
          .upsert(itemsToInsert) // Use upsert instead of insert
          
      // Delete removed items if editing
      if (isEditingQuote && initialData?.quotation_items) {
        const currentItemIds = new Set(itemsToInsert.map(i => i.id));
        const itemsToDelete = initialData.quotation_items
          .filter((i: any) => !currentItemIds.has(i.id))
          .map((i: any) => i.id);
          
        if (itemsToDelete.length > 0) {
          const { error: delErr } = await supabase.from('quotation_items').delete().in('id', itemsToDelete);
          if (delErr) console.error("Failed to delete removed items", delErr);
        }
      }
          
        if (itemsError) {
          console.error("[QUOTATION SAVE] Step 5 FAILED (Quotation Items)", JSON.stringify(itemsError, null, 2));
          throw new Error(`Quotation Items Save Failed: ${itemsError.message} (${itemsError.code})`);
        }
      }

      // 4. Redirect to view page
      router.push(`/quotations/${quote.id}`)

    } catch (err: any) {
      console.error("[QUOTATION SAVE] CAUGHT ERROR:", err)
      setError(err.message || 'Unable to save the quotation. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="pb-24">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link href="/quotations" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-4"><img src="/rapide-logo.png" alt="Rapidé" className="h-10 w-auto object-contain" /><h2 className="text-3xl font-bold text-slate-800">{isEditingQuote ? "Edit Quotation" : "New Quotation"}</h2></div>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Save size={18} />
          {isSubmitting ? "Saving..." : isEditingQuote ? "Update Quotation" : "Save Quotation"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}

      {/* SEARCH BAR */}
      {/* Enhanced Customer Search UI */}
      <div className="mb-4" ref={searchRef}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-800">Customer</h3>
        </div>
        <div className="flex gap-4 items-start">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search or select customer..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  if (selectedCustomerId) {
                     // If they start typing again, clear the selected customer to allow searching a different one
                     handleClearCustomer()
                     setCustomerSearch(e.target.value) // re-apply since clear clears it
                  }
                  setShowDropdown(true)
                }}
                onClick={() => {
                  if (customerSearch === '') {
                     setShowDropdown(true)
                  } else {
                     setShowDropdown(!showDropdown)
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
            
            {showDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[350px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((cust) => {
                    const searchDisplayName = formatCustomerName(cust)
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{searchDisplayName}</div>
                          <div className="text-sm text-slate-500 capitalize">{cust.customer_type} • {cust.mobile || cust.telephone || 'No contact number'}</div>
                          {cust.matched_vehicle && (
                            <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                              <Car size={14} /> {cust.matched_vehicle.make} {cust.matched_vehicle.model} • {cust.matched_vehicle.plate_number}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded capitalize">{cust.customer_type}</span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-slate-500">No customers found</div>
                )}
              </div>
            )}
          </div>
          
          {selectedCustomerId && !isEditingCustomer && (
            <button
              type="button"
              onClick={() => setIsEditingCustomer(true)}
              className="p-3 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex-shrink-0"
              title="Edit Customer"
            >
              <Edit size={20} />
            </button>
          )}
          {selectedCustomerId && (
            <button
              type="button"
              onClick={() => {
                handleClearCustomer()
                setShowDropdown(false)
              }}
              className="p-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex-shrink-0"
              title="Clear Customer"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              handleClearCustomer()
                setIsAddingCustomer(true)
                setShowDropdown(false)
              }}
              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add New Customer
          </button>
        </div>
      </div>

      {/* Enhanced Vehicle Search UI */}
      {selectedCustomerId && (
        <div className="mb-4" ref={vehicleSearchRef}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Vehicle</h3>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1 relative">
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search or select vehicle..."
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value)
                    if (selectedVehicleId) {
                      setSelectedVehicleId(null)
                    }
                    setShowVehicleDropdown(true)
                  }}
                  onClick={() => {
                    if (vehicleSearch === '') setShowVehicleDropdown(true)
                    else setShowVehicleDropdown(!showVehicleDropdown)
                  }}
                  onFocus={() => setShowVehicleDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              
              {showVehicleDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[350px] overflow-y-auto">
                  {(() => {
                     const searchLower = vehicleSearch.toLowerCase();
                     const filteredVehicles = customerVehicles.filter(v => {
                       if (!searchLower) return true;
                       const str = `${v.plate_number || ''} ${v.make || ''} ${v.model || ''} ${v.year || ''}`.toLowerCase();
                       return str.includes(searchLower);
                     });
                     
                     if (filteredVehicles.length === 0) {
                       return <div className="p-4 text-center text-slate-500">No vehicles found for this customer.</div>
                     }
                     
                     return filteredVehicles.map(v => (
                       <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVehicle(v)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                       >
                         <div>
                           <div className="font-semibold text-slate-900">{formatVehicleName(v)}</div>
                         </div>
                         <Car size={16} className="text-slate-400" />
                       </button>
                     ))
                  })()}
                </div>
              )}
            </div>
            
            {selectedVehicleId && !isEditingVehicle && (
            <button
              type="button"
              onClick={() => setIsEditingVehicle(true)}
              className="p-3 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex-shrink-0"
              title="Edit Vehicle"
            >
              <Edit size={20} />
            </button>
          )}
          {selectedVehicleId && (
            <button
              type="button"
              onClick={() => {
                setSelectedVehicleId(null)
                setVehiclePlate('')
    setVin('')
    setEngineCapacity('')
    setVehicleMake('')
                setVehicleModel('')
                setVehicleYear('')
                setVehicleTransmission('')
                setMileage('')
                setVehicleSearch('')
                setIsAddingVehicle(false)
                setIsEditingVehicle(false)
                setShowVehicleDropdown(false)
              }}
              className="p-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex-shrink-0"
              title="Clear Vehicle"
            >
              <X size={20} />
            </button>
          )}
          <button
              type="button"
              onClick={() => {
                setSelectedVehicleId(null)
                setVehiclePlate('')
    setVin('')
    setEngineCapacity('')
    setVehicleMake('')
                setVehicleModel('')
                setVehicleYear('')
                setVehicleTransmission('')
                setMileage('')
                setVehicleSearch('')
                setIsAddingVehicle(true)
                setShowVehicleDropdown(false)
              }}
              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add New Vehicle
            </button>
          </div>
        </div>
      )}

      {/* Service Details */}
      <div className="mb-4 bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Service Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <select value={serviceAdvisorId} onChange={e => setServiceAdvisorId(e.target.value)} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select an Advisor...</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mechanic</label>
            <select value={mechanicId} onChange={e => setMechanicId(e.target.value)} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select a Mechanic...</option>
              {mechanics.map(mech => (
                <option key={mech.id} value={mech.id}>{mech.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
            <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-md p-3" placeholder="10500" />
          </div>
        </div>
      </div>

      {/* SECTION 1: PACKAGES */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Packages</h3>
        </div>
        
        <div className="mb-4">
          <SearchableCombobox
            options={packages.map(p => ({
              id: p.id,
              name: p.name,
              subtext: `${p.category || 'No Category'} • ${p.package_items?.length || 0} items • ₱${p.package_price?.toLocaleString() || '0'}`
            }))}
            value=""
            onChange={(pkgId) => {
              const pkg = packages.find(p => p.id === pkgId)
              if (pkg) {
                const needsResolution = (pkg.package_items || []).some((pi: any) => pi.is_category)
                if (needsResolution) {
                  setPendingPackage(pkg)
                } else {
                  addPackageToItems(pkg)
                }
              }
            }}
            placeholder="Search package to add..."
            searchPlaceholder="Search packages by name or category..."
          />
        </div>

        <div className="space-y-2">
          {items.filter(i => i.item_type === 'PACKAGE').map((item, index) => (
            <div key={item.id} className="bg-slate-50 border border-slate-200 p-3 rounded-md flex gap-3 items-center">
              <div className="flex-1 font-bold text-blue-900 text-lg flex items-center gap-2">
                {item.description}
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wide">Package</span>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min="1" step="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-center"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0" step="0.01"
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-right bg-white"
                  disabled
                />
              </div>
              <div className="w-32 text-right pr-2">
                <span className="font-bold text-slate-800 text-lg">
                  ₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {items.filter(i => i.item_type === 'PACKAGE').length === 0 && (
            <p className="text-center text-slate-400 py-4">No packages added.</p>
          )}
        </div>
      </div>

      {/* SECTION 2: LABOR & SERVICES */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Labor & Services</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => addItem(false, 'MANUAL')} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Manual Labor
            </button>
            <button type="button" onClick={() => addItem(true, 'MANUAL')} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Section Header
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <SearchableCombobox
            options={laborServices.map(s => ({
              id: s.id,
              name: s.name,
              subtext: `${s.labor_groups?.name || 'No Group'} • ${s.labor_categories?.name || 'No Category'} • ₱${s.rate?.toLocaleString() || '0'}`
            }))}
            value=""
            onChange={(laborId) => {
              const service = laborServices.find(s => s.id === laborId)
              if (service) {
                const alreadyAdded = items.some(i => i.labor_service_id === service.id)
                if (alreadyAdded) {
                  setError(`"${service.name}" is already added to this quotation.`)
                  setTimeout(() => setError(null), 3000)
                  return
                }
                setItems(prev => [...prev, {
                  id: crypto.randomUUID(),
                  item_type: 'LABOR',
                  description: service.name,
                  quantity: 1,
                  unit_price: service.rate ?? '',
                  is_section_header: false,
                  labor_service_id: service.id,
                  group_id: service.group_id,
                  category_id: service.category_id,
                  group_name_snapshot: service.labor_groups?.name,
                  category_name_snapshot: service.labor_categories?.name,
                  standard_hour_snapshot: service.standard_hours,
                }])
              }
            }}
            placeholder="Search labor / service to add..."
            searchPlaceholder="Search by service, group, or category..."
            onAddNew={(query) => {
              setNewLaborSearchQuery(query)
              setActiveItemIndexForModal(null)
              setIsNewLaborModalOpen(true)
            }}
            addNewLabel="+ Add New Labor"
          />
        </div>

        <div className="space-y-2">
          {items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id)).map((item, index) => (
            <div key={item.id} className={`flex gap-3 items-center ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2' : 'py-1'}`}>
              <div className="flex-1">
                {item.is_section_header ? (
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. LABOR CHARGES"
                    className="w-full border border-slate-300 rounded-md p-2 font-bold bg-transparent"
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Labor description..."
                      className={`w-full border border-slate-300 rounded-md p-2 ${item.labor_service_id ? 'bg-blue-50 font-medium text-blue-900' : ''} ${item.item_type === 'PACKAGE_ITEM' ? 'pl-8' : ''}`}
                      disabled={item.item_type === 'PACKAGE_ITEM'}
                    />
                    {item.item_type === 'PACKAGE_ITEM' && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                         <span className="w-4 h-4 bg-blue-200 text-blue-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                      </div>
                    )}
                  </div>
                )}
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
                      className="w-full border border-slate-300 rounded-md p-2 text-center"
                    />
                  </div>
                  <div className="w-32">
                    {item.item_type === 'PACKAGE_ITEM' ? (
                      <div className="w-full p-2 text-right text-slate-400 text-sm italic">
                        Inc. in Pkg
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="0" step="0.01"
                        value={item.unit_price}
                        onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                        placeholder="Price"
                        className="w-full border border-slate-300 rounded-md p-2 text-right"
                      />
                    )}
                  </div>
                  <div className="w-32 text-right font-medium text-slate-800 pr-2">
                    {item.item_type === 'PACKAGE_ITEM' ? (
                       <span className="text-slate-400 italic">₱0.00</span>
                    ) : (
                       <span>₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </>
              )}
              {item.is_section_header && (
                <div className="w-[304px]"></div>
              )}
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id)).length === 0 && (
            <p className="text-center text-slate-400 py-4">No labor added.</p>
          )}
        </div>
      </div>

      {/* SECTION 3: PARTS & MATERIALS */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Parts & Materials</h3>
        </div>
        
        <div className="mb-4">
          <PartSearchSelector 
            selectedPartId={""}
            setSelectedPartId={() => {}}
            onSelectPart={(part) => {
              if (part) {
                const alreadyAdded = items.some(i => i.part_id === part.id && i.item_type === 'PART')
                if (alreadyAdded) {
                  setError(`"${part.name}" is already added to this quotation.`)
                  setTimeout(() => setError(null), 3000)
                  return
                }
                setItems(prev => [...prev, {
                  id: crypto.randomUUID(),
                  item_type: 'PART',
                  description: part.name,
                  quantity: 1,
                  unit_price: part.selling_price ?? 0,
                  is_section_header: false,
                  part_id: part.id,
                }])
              }
            }}
          />
        </div>

        <div className="space-y-2">
          {items.filter(i => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category))).map((item, index) => (
            <div key={item.id} className="flex gap-3 items-center py-1">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Part description..."
                    className={`w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900 ${item.item_type === 'PACKAGE_ITEM' ? 'pl-8' : ''}`}
                    disabled={item.item_type === 'PACKAGE_ITEM'}
                  />
                  {item.item_type === 'PACKAGE_ITEM' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                       <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="0.1" step="0.1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-full border border-slate-300 rounded-md p-2 text-center"
                />
              </div>
              <div className="w-32">
                {item.item_type === 'PACKAGE_ITEM' ? (
                  <div className="w-full p-2 text-right text-slate-400 text-sm italic">
                    Inc. in Pkg
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0" step="0.01"
                    value={item.unit_price}
                    onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    placeholder="Price"
                    className="w-full border border-slate-300 rounded-md p-2 text-right"
                  />
                )}
              </div>
              <div className="w-32 text-right font-medium text-slate-800 pr-2 flex items-center justify-end h-full">
                {item.item_type === 'PACKAGE_ITEM' ? (
                   <span className="text-slate-400 italic mt-2">₱0.00</span>
                ) : (
                   <span className="mt-2">₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </div>
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {items.filter(i => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category))).length === 0 && (
            <p className="text-center text-slate-400 py-4">No individual parts added.</p>
          )}
        </div>
      </div>

      {/* Footer / Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Terms</label>
              <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prepared By</label>
              <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md p-2" placeholder="Any additional notes..."></textarea>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white rounded-lg shadow-sm p-4 flex flex-col justify-end">
          <div className="space-y-3 mb-4">
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
      <NewLaborModal 
        isOpen={isNewLaborModalOpen} 
        onClose={() => setIsNewLaborModalOpen(false)}
        initialName={newLaborSearchQuery}
        onSuccess={(newLabor) => {
          setIsNewLaborModalOpen(false)
          setLaborServices(prev => [...prev, newLabor].sort((a: any, b: any) => a.name.localeCompare(b.name)))
          
          // Add the new labor as a new row
          setItems(prev => [...prev, {
            id: crypto.randomUUID(),
            description: newLabor.name,
            quantity: 1,
            unit_price: newLabor.rate ?? '',
            is_section_header: false,
            labor_service_id: newLabor.id,
            group_id: newLabor.group_id,
            category_id: newLabor.category_id,
            group_name_snapshot: newLabor.labor_groups?.name,
            category_name_snapshot: newLabor.labor_categories?.name,
            standard_hour_snapshot: newLabor.standard_hours,
          }])
        }}
      />

      {/* RESOLVE PACKAGE MODAL */}
      {pendingPackage && (
        <PackageResolveModal
          pkg={pendingPackage}
          onClose={() => setPendingPackage(null)}
          onApply={(resolvedParts) => addPackageToItems(pendingPackage, resolvedParts)}
        />
      )}

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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                      <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chassis Number / VIN</label>
                      <input type="text" value={vin} onChange={e => setVin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="KNCSHX..." />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                      <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                      <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                  <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
                </div>
                <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
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
              <button type="button" onClick={handleSaveVehicleChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                {isAddingVehicle ? 'Save New Vehicle' : 'Save Vehicle Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  )
}
