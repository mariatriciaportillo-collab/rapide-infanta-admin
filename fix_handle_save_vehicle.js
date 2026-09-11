const fs = require('fs')

const files = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quick-sale/QuickSaleForm.tsx',
  'src/components/quotations/QuotationForm.tsx'
]

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8')
  
  // QuickSaleForm has a try/catch block, Quotation/Estimate don't.
  // We'll replace the entire function in each file carefully.

  if (file.includes('QuickSaleForm')) {
    const oldFn = `  const handleSaveVehicleChanges = async () => {
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
        
        setCustomerVehicles(prev => [...prev, data])
        handleSelectVehicle(data)
        setIsAddingVehicle(false)
      } else if (isEditingVehicle && selectedVehicleId) {
        const { data, error } = await supabase.from('vehicles').update({
          plate_number: vehiclePlate.toUpperCase(),
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
                              transmission: vehicleTransmission
        }).eq('id', selectedVehicleId).select().single()

        if (error) throw new Error(error.message)
        
        setCustomerVehicles(prev => prev.map(v => v.id === data.id ? data : v))
        handleSelectVehicle(data)
        setIsEditingVehicle(false)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }`
    // QuickSaleForm isn't matching perfectly with that string. Let's just use regex.
  }

  // Let's just do a regex replace to ensure setIsSavingVehicle(false) is called before every return and at the end.
  // It's easier to just append a finally block, but it's not wrapped in try/catch in QuotationForm.
  
})
