const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix Customer Search
const oldCustomerSearch = `      if (customerSearch.length < 2) { setCustomers([]); return; }
      const searchTerm = customerSearch.trim()
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(\`first_name.ilike.%\${searchTerm}%,last_name.ilike.%\${searchTerm}%,company_name.ilike.%\${searchTerm}%,legacy_name.ilike.%\${searchTerm}%\`)
        .limit(10)
      if (data) setCustomers(data)`;

const newCustomerSearch = `      // Fetch all if empty, otherwise search
      const searchTerm = customerSearch.trim()
      let query = supabase.from('customers').select('*').limit(20)
      
      if (searchTerm.length > 0) {
        query = query.or(\`name.ilike.%\${searchTerm}%,first_name.ilike.%\${searchTerm}%,last_name.ilike.%\${searchTerm}%,legacy_name.ilike.%\${searchTerm}%\`)
      }
      
      const { data } = await query
      if (data) setCustomers(data)`;

content = content.replace(oldCustomerSearch, newCustomerSearch);

// Fix Vehicle Search
const oldVehicleSearch = `      if (vehicleSearch.length < 2 || !selectedCustomerId) { setVehicles([]); return; }
      const searchTerm = vehicleSearch.trim()
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .or(\`plate_number.ilike.%\${searchTerm}%,make.ilike.%\${searchTerm}%,model.ilike.%\${searchTerm}%\`)
        .limit(10)
      if (data) setVehicles(data)`;

const newVehicleSearch = `      if (!selectedCustomerId) { setVehicles([]); return; }
      const searchTerm = vehicleSearch.trim()
      let query = supabase.from('vehicles').select('*').eq('customer_id', selectedCustomerId).limit(20)
      
      if (searchTerm.length > 0) {
        query = query.or(\`plate_number.ilike.%\${searchTerm}%,make.ilike.%\${searchTerm}%,model.ilike.%\${searchTerm}%\`)
      }
      
      const { data } = await query
      if (data) setVehicles(data)`;

content = content.replace(oldVehicleSearch, newVehicleSearch);

// Fix onFocus handlers in the render UI
content = content.replace(/onChange=\{e => \{ setCustomerSearch\(e\.target\.value\); setSelectedCustomerId\(null\); \}\}/, "onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomerId(null); }}\n                  onFocus={() => { if (!selectedCustomerId && customers.length === 0) setCustomerSearch(' '); setCustomerSearch(''); }}");

content = content.replace(/onChange=\{e => \{ setVehicleSearch\(e\.target\.value\); setSelectedVehicleId\(null\); \}\}/, "onChange={e => { setVehicleSearch(e.target.value); setSelectedVehicleId(null); }}\n                  onFocus={() => { if (!selectedVehicleId && vehicles.length === 0) setVehicleSearch(' '); setVehicleSearch(''); }}");

// Add mobile to states if missing
if (!content.includes('const [mobile, setMobile] = useState')) {
  content = content.replace(/const \[customerTelephone, setCustomerTelephone\] = useState\(''\)/, "const [customerTelephone, setCustomerTelephone] = useState('')\n  const [mobile, setMobile] = useState('')");
}

fs.writeFileSync(path, content);
