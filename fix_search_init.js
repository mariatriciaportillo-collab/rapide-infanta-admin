const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

// Set Edit Quotation title
file = file.replace(/<h2 className="text-3xl font-bold text-slate-800">New Quotation<\/h2>/, '<h2 className="text-3xl font-bold text-slate-800">{isEditingQuote ? "Edit Quotation" : "New Quotation"}</h2>');
// Wait, is there a button with "Save Quotation"?
file = file.replace(/{isSubmitting \? 'Saving\.\.\.' : 'Save Quotation'}/, '{isSubmitting ? "Saving..." : isEditingQuote ? "Update Quotation" : "Save Quotation"}');

// InitialData: Set customerSearch and vehicleSearch
const initCustomerRegex = /setDisplayContactPerson\(formatContactPerson\(initialData\.customers\)\)/;
file = file.replace(initCustomerRegex, 'setDisplayContactPerson(formatContactPerson(initialData.customers))\n        setCustomerSearch(formatCustomerName(initialData.customers))');

const initVehicleRegex = /setMileage\(initialData\.mileage_km \? String\(initialData\.mileage_km\) : ''\)/;
const vehicleFix = `setMileage(initialData.mileage_km ? String(initialData.mileage_km) : '')
      
      if (initialData.vehicles) {
        const v = initialData.vehicles;
        setVehicleSearch(v.plate_number + (v.make ? ' - ' + v.make : '') + (v.model ? ' ' + v.model : ''));
      }`;
file = file.replace(initVehicleRegex, vehicleFix);

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
