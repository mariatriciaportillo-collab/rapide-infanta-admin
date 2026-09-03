const fs = require('fs');

function patchQuote(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/import \{ ApproveQuotationButton \}.*/, "import { QuotationActionBar } from '@/components/quotations/QuotationActionBar'");
  
  const regex = /<div className="flex gap-3">[\s\S]*?<\/div>\s*<\/div>/;
  const replacement = `<QuotationActionBar quotationId={quote.id} initialStatus={quote.status} initialEstimateId={est?.id} />\n      </div>`;
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

function patchEstimate(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('EstimateActionBar')) {
    content = content.replace(/import \{ format \} from 'date-fns'/, "import { format } from 'date-fns'\nimport { EstimateActionBar } from '@/components/estimates/EstimateActionBar'");
  }
  
  // Replace the current Action buttons in Estimate View
  // Currently they are Link to /estimates/.../print and maybe Mark Approved
  const regex = /<div className="flex gap-3">[\s\S]*?<\/div>\s*<\/div>/;
  const replacement = `<EstimateActionBar estimateId={estimate.id} initialStatus={estimate.status || ''} />\n      </div>`;
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

patchQuote('src/app/(dashboard)/quotations/[id]/page.tsx');
patchEstimate('src/app/(dashboard)/estimates/[id]/page.tsx');
