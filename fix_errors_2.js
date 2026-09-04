const fs = require('fs');

let pagePath = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');
if (!page.includes("import { useSearchParams } from 'next/navigation'")) {
  page = page.replace(
    "import { useParams, useRouter } from 'next/navigation'", 
    "import { useParams, useRouter, useSearchParams } from 'next/navigation'"
  );
  page = page.replace(
    "import { useRouter } from 'next/navigation'", 
    "import { useRouter, useSearchParams } from 'next/navigation'"
  );
}
fs.writeFileSync(pagePath, page);

let formPath = 'src/components/quick-sale/QuickSaleForm.tsx';
let form = fs.readFileSync(formPath, 'utf8');
form = form.replace(
  "import { Search, Plus, X, Edit, Trash2, ArrowRightCircle, Save, User, Car } from 'lucide-react'",
  "import { Search, Plus, X, Edit, Trash2, ArrowRightCircle, Save, User, Car, Building2 } from 'lucide-react'"
);
fs.writeFileSync(formPath, form);
