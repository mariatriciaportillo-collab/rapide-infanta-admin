const fs = require('fs');

function addImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { saveCustomerRecord }')) {
    content = content.replace(/import \{ formatCustomerName[\s\S]*?\} from '@\/utils\/customer'/g, match => match + "\nimport { saveCustomerRecord } from '@/utils/customerSaveHelper'");
    fs.writeFileSync(file, content);
  }
}

addImport('src/components/quotations/QuotationForm.tsx');
addImport('src/components/estimates/EstimateForm.tsx');
addImport('src/components/quick-sale/QuickSaleForm.tsx');
