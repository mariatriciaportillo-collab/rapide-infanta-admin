const fs = require('fs');
const path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add inventory_deducted = true to the queries for Collectibles
content = content.replace(/\.in\('status', \['UNPAID', 'PARTIALLY PAID'\]\)/g, ".in('status', ['UNPAID', 'PARTIALLY PAID']).eq('inventory_deducted', true)");

fs.writeFileSync(path, content);
