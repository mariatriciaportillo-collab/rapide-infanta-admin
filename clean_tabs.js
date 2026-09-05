const fs = require('fs');

let code = fs.readFileSync('src/components/customers/CustomerTabs.tsx', 'utf8');

// 1. Remove all Pagination tags currently in the file to start fresh
code = code.replace(/\{\s*[a-zA-Z]+\.length > 0 && \(\s*<Pagination[^>]+>\s*\)\s*\}/g, '');

// Now explicitly inject the EXACT Pagination calls where they actually belong.

// A) For Vehicles tab:
code = code.replace(
  /<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\)\}/g,
  "</div>\n            )}\n            {vehicles.length > 0 && (\n              <Pagination totalCount={vehicles.length} pageSize={PAGE_SIZE} currentPage={vehiclesPage} onPageChange={setVehiclesPage} />\n            )}\n          </div>\n        )}"
);

// B) For Estimates tab:
// We look for: </tbody>\n              </table>\n            )}
// wait, we have two tables (estimates and sales-history). Let's use a smarter replace.
// Split by tabs!
let parts = code.split("{activeTab === 'estimates' && (");
let customerAndVehicles = parts[0];
let rest = parts[1];
let parts2 = rest.split("{activeTab === 'service-history' && (");
let estimatesTab = parts2[0];
let rest2 = parts2[1];
let parts3 = rest2.split("{activeTab === 'sales-history' && (");
let serviceHistoryTab = parts3[0];
let salesHistoryTab = parts3[1];

// Fix estimatesTab
estimatesTab = estimatesTab.replace(/<\/table>\n\s*\)\}/g, "</table>\n            )}\n            {estimates.length > 0 && (\n              <Pagination totalCount={estimates.length} pageSize={PAGE_SIZE} currentPage={estimatesPage} onPageChange={setEstimatesPage} />\n            )}");

// Fix salesHistoryTab
salesHistoryTab = salesHistoryTab.replace(/<\/table>\n\s*\)\}/g, "</table>\n            )}\n            {quickSales.length > 0 && (\n              <Pagination totalCount={quickSales.length} pageSize={PAGE_SIZE} currentPage={salesPage} onPageChange={setSalesPage} />\n            )}");

code = customerAndVehicles + "{activeTab === 'estimates' && (" + estimatesTab + "{activeTab === 'service-history' && (" + serviceHistoryTab + "{activeTab === 'sales-history' && (" + salesHistoryTab;

fs.writeFileSync('src/components/customers/CustomerTabs.tsx', code);
console.log('Cleaned up tabs');
