const fs = require('fs');

const path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add useSearchParams if not present
if (!content.includes('useSearchParams')) {
  content = content.replace("import { useParams, useRouter } from 'next/navigation'", "import { useParams, useRouter, useSearchParams } from 'next/navigation'");
}

// Add searchParams hook
if (!content.includes('const searchParams = useSearchParams()')) {
  content = content.replace("const router = useRouter()", "const router = useRouter()\n  const searchParams = useSearchParams()");
}

// Add auto-open logic
const autoOpenStr = `useEffect(() => {
    if (!loading && sale && sale.inventory_deducted && searchParams.get('pay') === 'true' && (sale.status === 'UNPAID' || sale.status === 'PARTIALLY PAID')) {
      setPayAmount(sale.balance_due);
      setShowPaymentModal(true);
      // Clean up URL to prevent re-opening on refresh
      router.replace(\`/quick-sale/\${sale.id}\`);
    }
  }, [loading, sale, searchParams, router])`;

if (!content.includes('searchParams.get(\'pay\')')) {
  content = content.replace("if (loading) return", `${autoOpenStr}\n\n  if (loading) return`);
}

fs.writeFileSync(path, content);
console.log('Patched quick sale view page for auto-pay');
