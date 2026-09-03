const fs = require('fs');

const qf = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

let startIndex = qf.indexOf('{/* CUSTOMER MODAL */}');
let endIndex = qf.lastIndexOf('</form>');

if (startIndex > -1 && endIndex > -1) {
  const modals = qf.substring(startIndex, endIndex);
  
  let qs = fs.readFileSync('src/components/quick-sale/QuickSaleForm.tsx', 'utf8');
  const qsStart = qs.indexOf('{/* Note: In a full app');
  const qsEnd = qs.lastIndexOf('</div>');
  
  if (qsStart > -1) {
    qs = qs.substring(0, qsStart) + modals + '\n    </div>\n  )\n}\n';
    fs.writeFileSync('src/components/quick-sale/QuickSaleForm.tsx', qs);
    console.log("Successfully replaced modals in QuickSaleForm.tsx");
  } else {
    console.log("Could not find insertion point in QuickSaleForm");
  }
} else {
  console.log("Could not find modals in QuotationForm");
}
