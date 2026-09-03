const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace customerMobile with mobile
content = content.replace(/customerMobile/g, 'mobile');
content = content.replace(/setCustomerMobile/g, 'setMobile');

// Add vin
if (!content.includes('const [vin, setVin]')) {
  content = content.replace(
    /const \[vehicleTransmission, setVehicleTransmission\] = useState\(''\)/,
    "const [vehicleTransmission, setVehicleTransmission] = useState('')\n  const [vin, setVin] = useState('')"
  );
}

fs.writeFileSync(path, content);
