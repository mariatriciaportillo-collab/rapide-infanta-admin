const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add states
content = content.replace(/const \[customerSearch, setCustomerSearch\] = useState\(''\)/, "const [customerSearch, setCustomerSearch] = useState('')\n  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)");
content = content.replace(/const \[vehicleSearch, setVehicleSearch\] = useState\(''\)/, "const [vehicleSearch, setVehicleSearch] = useState('')\n  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)");

// Update Customer Input
content = content.replace(
  /onFocus=\{.*?\}[\s\S]*?placeholder="Search customer\.\.\."/,
  `onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  placeholder="Search customer..."`
);

// Update Customer Dropdown Condition
content = content.replace(
  /\{customers\.length > 0 && !selectedCustomerId && \(/,
  "{showCustomerDropdown && customers.length > 0 && !selectedCustomerId && ("
);

// Update Vehicle Input
content = content.replace(
  /onFocus=\{.*?\}[\s\S]*?placeholder=\{selectedCustomerId \? "Search vehicle\.\.\." : "Select customer first"\}/,
  `onFocus={() => setShowVehicleDropdown(true)}
                  onBlur={() => setTimeout(() => setShowVehicleDropdown(false), 200)}
                  placeholder={selectedCustomerId ? "Search vehicle..." : "Select customer first"}`
);

// Update Vehicle Dropdown Condition
content = content.replace(
  /\{vehicles\.length > 0 && !selectedVehicleId && \(/,
  "{showVehicleDropdown && vehicles.length > 0 && !selectedVehicleId && ("
);

fs.writeFileSync(path, content);
