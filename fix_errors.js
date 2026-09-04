const fs = require('fs');

// 1. Fix quick-sale/[id]/page.tsx
let pagePath = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');
if (!page.includes("import { useSearchParams } from 'next/navigation'")) {
  page = page.replace("import { useParams, useRouter, useSearchParams } from 'next/navigation'", "import { useParams, useRouter } from 'next/navigation'\nimport { useSearchParams } from 'next/navigation'");
}
fs.writeFileSync(pagePath, page);

// 2. Fix QuickSaleForm.tsx
let formPath = 'src/components/quick-sale/QuickSaleForm.tsx';
let form = fs.readFileSync(formPath, 'utf8');

form = form.replace("import { Search, Plus, X, Edit, Trash2, ArrowRightCircle, Save, User, Car } from 'lucide-react'", "import { Search, Plus, X, Edit, Trash2, ArrowRightCircle, Save, User, Car, Building2 } from 'lucide-react'");
form = form.replace(/const \[mobile, setMobile\]/g, "const [customerMobile, setCustomerMobile]");
form = form.replace(/mobile: mobile/g, "mobile: customerMobile");
form = form.replace(/setMobile\(/g, "setCustomerMobile(");
form = form.replace(/cust\.mobile/g, "cust.mobile");

// buildLegacyName fix (it expects 5 args: type, firstName, lastName, companyName, contactPerson)
// Let's check QuotationForm to see how it calls it
// QuotationForm calls it with 4 arguments? Let's see src/utils/customer.ts
