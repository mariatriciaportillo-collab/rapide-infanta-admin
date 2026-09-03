const fs = require('fs');

function addHandleClearVehicle(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const clearCustRegex = /const handleClearCustomer = \(\) => \{[\s\S]*?\}/;
  
  const replacement = `$&
  
  const handleClearVehicle = () => {
    setSelectedVehicleId(null)
    setVehicleSearch('')
    setVehiclePlate('')
    setVin('')
    setVehicleMake('')
    setVehicleModel('')
    setVehicleYear('')
    setEngineCapacity('')
    setVehicleTransmission('')
  }`;
  
  content = content.replace(clearCustRegex, replacement);
  fs.writeFileSync(filePath, content);
}

addHandleClearVehicle('src/components/quotations/QuotationForm.tsx');
addHandleClearVehicle('src/components/estimates/EstimateForm.tsx');
