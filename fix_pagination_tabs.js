const fs = require('fs');
let tabs = fs.readFileSync('src/components/customers/CustomerTabs.tsx', 'utf8');

// Add import
tabs = tabs.replace(/import \{ CustomerServiceHistory \} from '.\/CustomerServiceHistory'/g, "import { CustomerServiceHistory } from './CustomerServiceHistory'\nimport { Pagination } from '@/components/ui/Pagination'");

// Add state for pagination
tabs = tabs.replace(/const \[activeTab, setActiveTab\] = useState\('customer'\)/g, "const [activeTab, setActiveTab] = useState('customer')\n  const [vehiclesPage, setVehiclesPage] = useState(1)\n  const [estimatesPage, setEstimatesPage] = useState(1)\n  const [salesPage, setSalesPage] = useState(1)\n  const PAGE_SIZE = 10");

// Apply pagination logic for vehicles
tabs = tabs.replace(/Vehicles \(\{vehicles\.length\}\)/g, "Vehicles ({vehicles.length})");
tabs = tabs.replace(/\{vehicles\.map\(v => \(/g, "{vehicles.slice((vehiclesPage - 1) * PAGE_SIZE, vehiclesPage * PAGE_SIZE).map(v => (");
tabs = tabs.replace(/<\/div>\n            \)\}/g, "</div>\n            )}\n            {vehicles.length > 0 && (\n              <Pagination totalCount={vehicles.length} pageSize={PAGE_SIZE} currentPage={vehiclesPage} onPageChange={setVehiclesPage} />\n            )}");

// Apply pagination logic for estimates
tabs = tabs.replace(/\{estimates\.map\(est => \(/g, "{estimates.slice((estimatesPage - 1) * PAGE_SIZE, estimatesPage * PAGE_SIZE).map(est => (");
tabs = tabs.replace(/<\/table>\n            \)\}/g, "</table>\n            )}\n            {estimates.length > 0 && (\n              <Pagination totalCount={estimates.length} pageSize={PAGE_SIZE} currentPage={estimatesPage} onPageChange={setEstimatesPage} />\n            )}");

// Apply pagination logic for quick sales
tabs = tabs.replace(/\{quickSales\.map\(qs => \(/g, "{quickSales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE).map(qs => (");
tabs = tabs.replace(/<\/table>\n            \)\}/g, "</table>\n            )}\n            {quickSales.length > 0 && (\n              <Pagination totalCount={quickSales.length} pageSize={PAGE_SIZE} currentPage={salesPage} onPageChange={setSalesPage} />\n            )}");

fs.writeFileSync('src/components/customers/CustomerTabs.tsx', tabs);

// Now for CustomerServiceHistory
let sh = fs.readFileSync('src/components/customers/CustomerServiceHistory.tsx', 'utf8');
sh = sh.replace(/import Link from 'next\/link'/g, "import Link from 'next/link'\nimport { Pagination } from '@/components/ui/Pagination'");
sh = sh.replace(/const \[selectedVehicle, setSelectedVehicle\] = useState\('all'\)/g, "const [selectedVehicle, setSelectedVehicle] = useState('all')\n  const [page, setPage] = useState(1)\n  const PAGE_SIZE = 10");
sh = sh.replace(/\{filteredInvoices\.map\(inv => \{/g, "{filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(inv => {");
sh = sh.replace(/<\/div>\n      \)\}/g, "</div>\n      )}\n      {filteredInvoices.length > 0 && (\n        <Pagination totalCount={filteredInvoices.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />\n      )}");

// Also reset page when selectedVehicle changes
sh = sh.replace(/onChange=\{e => setSelectedVehicle\(e\.target\.value\)\}/g, "onChange={e => { setSelectedVehicle(e.target.value); setPage(1); }}");

fs.writeFileSync('src/components/customers/CustomerServiceHistory.tsx', sh);
console.log('Pagination applied to tabs.');
