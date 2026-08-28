import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Add isAddingCustomer state
if "const [isAddingCustomer" not in content:
    content = content.replace("const [isEditingCustomer", "const [isAddingCustomer, setIsAddingCustomer] = useState(false)\n  const [isEditingCustomer")

# 2. Add handleCreateNewCustomer function
new_function = """  const handleCreateNewCustomer = async () => {
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
"""

if "const handleCreateNewCustomer" not in content:
    content = content.replace("const handleSaveCustomerChanges", new_function + "\n  const handleSaveCustomerChanges")


with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
