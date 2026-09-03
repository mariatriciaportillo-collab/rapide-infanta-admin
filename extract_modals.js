const fs = require('fs');

const qf = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const startIdxCustomer = qf.indexOf('{/* CUSTOMER MODAL */}');
const endIdxCustomer = qf.indexOf('{/* VEHICLE MODAL */}');
const endIdxVehicle = qf.indexOf('{/* Add Labor Modal */}'); // or whatever comes next in QuotationForm

if (startIdxCustomer !== -1 && endIdxCustomer !== -1 && endIdxVehicle !== -1) {
  const customerModal = qf.substring(startIdxCustomer, endIdxCustomer);
  const vehicleModal = qf.substring(endIdxCustomer, endIdxVehicle);
  fs.writeFileSync('customer_modal.txt', customerModal);
  fs.writeFileSync('vehicle_modal.txt', vehicleModal);
  console.log("Extracted modals.");
} else {
  console.log("Could not extract exactly.");
}
