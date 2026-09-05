const fs = require('fs');

const path = 'src/components/SidebarNav.tsx';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');

// Find boundaries automatically to be resilient
function findIndex(str) {
  return lines.findIndex(l => l.includes(str));
}

const idxOperations = findIndex('{/* OPERATIONS */}');
const idxCustomers = findIndex('{/* CUSTOMER ACCOUNTS */}');
const idxProducts = findIndex('{/* PRODUCTS & SERVICES */}');
const idxInventory = findIndex('{/* INVENTORY & PURCHASING */}');
const idxReports = findIndex('{/* REPORTS */}');
const idxAdmin = findIndex('{/* ADMINISTRATION */}');
const idxNavEnd = findIndex('</nav>');

// Slice arrays (keeping the blank lines intact if possible)
const header = lines.slice(0, idxOperations);
const operations = lines.slice(idxOperations, idxCustomers);
const customers = lines.slice(idxCustomers, idxProducts);
const products = lines.slice(idxProducts, idxInventory);
const inventory = lines.slice(idxInventory, idxReports);
const reports = lines.slice(idxReports, idxAdmin);
const admin = lines.slice(idxAdmin, idxNavEnd);
const footer = lines.slice(idxNavEnd);

// Reassemble main sections
const reassembledLines = [
  ...header,
  ...operations,
  ...products,
  ...inventory,
  ...customers,
  ...reports,
  ...admin,
  ...footer
];

let newContent = reassembledLines.join('\n');

// Now extract and reorder the Products & Services items
// We'll use regex to pull out the exact Link blocks inside PRODUCTS & SERVICES
const prodStartStr = '{/* PRODUCTS & SERVICES */}';
const prodEndStr = '{/* INVENTORY & PURCHASING */}';

const prodStartIndex = newContent.indexOf(prodStartStr);
const prodEndIndex = newContent.indexOf(prodEndStr);

let prodContent = newContent.substring(prodStartIndex, prodEndIndex);

const extractLink = (href) => {
  const regex = new RegExp(`(\\s*<Link\\s*\\n\\s*href="${href}"[\\s\\S]*?<\\/Link>)`);
  const match = prodContent.match(regex);
  if (!match) throw new Error(`Could not find link for ${href}`);
  prodContent = prodContent.replace(match[1], ''); // remove from original string temporarily
  return match[1];
};

const l_laborCharges = extractLink('/labor-charges');
const l_parts = extractLink('/parts');
const l_packages = extractLink('/packages');
const l_partLaborRules = extractLink('/part-labor-rules');
const l_laborLookup = extractLink('/labor-lookup');
const l_partsLookup = extractLink('/parts-lookup');

// Now replace the content back into the exact spot in the container
// The links were inside <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
const containerStartStr = '<div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">';
const insertIdx = prodContent.indexOf(containerStartStr) + containerStartStr.length;

const reorderedLinks = 
  l_laborCharges + 
  l_parts + 
  l_packages + 
  l_partLaborRules + 
  l_laborLookup + 
  l_partsLookup;

prodContent = prodContent.slice(0, insertIdx) + reorderedLinks + prodContent.slice(insertIdx);

newContent = newContent.substring(0, prodStartIndex) + prodContent + newContent.substring(prodEndIndex);

fs.writeFileSync(path, newContent);
console.log('Sidebar successfully reordered');

