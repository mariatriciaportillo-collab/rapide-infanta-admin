const fs = require('fs');

const formPath = 'src/components/quick-sale/QuickSaleForm.tsx';
let form = fs.readFileSync(formPath, 'utf8');

// Fix checkDuplicateCustomer
form = form.replace(
  /checkDuplicateCustomer\(supabase, \{\s*customerType,\s*firstName,\s*lastName,\s*companyName\s*\}\)/,
  "checkDuplicateCustomer(supabase, customerType, firstName, lastName, companyName)"
);

// Fix SearchableCombobox disabled
form = form.replace(/disabled=\{\!selectedCustomerId \|\| vehicles\.length === 0\}/, "");

// Fix discount state TS error
form = form.replace(
  /const grandTotal = Math\.max\(0, subtotal - Number\(discount \|\| 0\)\)/,
  "const grandTotal = Math.max(0, subtotal - Number(discount || 0))"
);
// TS error: src/components/quick-sale/QuickSaleForm.tsx(530,46): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number | "">'.
// This is because of setDiscount(e.target.value)
form = form.replace(/onChange=\{e => setDiscount\(e\.target\.value\)\}/, "onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}");

// Fix customerMobile/setCustomerMobile imports
form = form.replace(/setMobile/g, "setCustomerMobile");
form = form.replace(/mobile: mobile/g, "mobile: customerMobile");
form = form.replace(/const \[mobile,/g, "const [customerMobile,");
form = form.replace(/cust\.mobile/g, "cust.mobile");

// Fix Building2 import
if (!form.includes("Building2")) {
  form = form.replace("User, Car } from 'lucide-react'", "User, Car, Building2 } from 'lucide-react'");
}

fs.writeFileSync(formPath, form);
console.log('Fixed QuickSaleForm.tsx errors');
