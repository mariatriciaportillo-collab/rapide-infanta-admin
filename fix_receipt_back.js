const fs = require('fs');
const path = 'src/components/payments/PaymentReceipt.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure useRouter is imported
if (!content.includes("useRouter")) {
  content = content.replace("import React from 'react'", "import React from 'react'\nimport { useRouter } from 'next/navigation'");
}

// Ensure component uses router
if (!content.includes("const router = useRouter()")) {
  const compRegex = /(export function PaymentReceipt\([^)]+\)\s*\{)/;
  content = content.replace(compRegex, `$1\n  const router = useRouter()`);
}

// Replace window.history.back()
content = content.replace(
  /onClick=\{[^}]*window\.history\.back\(\)[^}]*\}/,
  `onClick={() => {\n          if (window.history.length > 2) {\n            router.back()\n          } else {\n            router.push('/payments')\n          }\n        }}`
);

fs.writeFileSync(path, content);
