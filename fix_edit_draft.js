const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const regex = /if \(initialData\) {\s*setSelectedCustomerId\(initialData\.customer_id\)\s*setSelectedVehicleId\(initialData\.vehicle_id \|\| null\)\s*setNotes\(initialData\.notes \|\| ''\)\s*setWarranty\(initialData\.warranty_terms \|\| ''\)\s*setPreparedBy\(initialData\.prepared_by \|\| ''\)\s*setDiscount\(initialData\.discount_amount \|\| 0\)/;

const replacement = `if (initialData) {
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
      setMileage(initialData.mileage_km ? String(initialData.mileage_km) : '')`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
