const fs = require('fs');

const qf = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');
const qsf = fs.readFileSync('src/components/quick-sale/QuickSaleForm.tsx', 'utf8');

// The best way to sync the customer/vehicle workflow is to just rewrite QuickSaleForm.
// I will build a clean QuickSaleForm from scratch using the proven Customer/Vehicle parts from QuotationForm.
