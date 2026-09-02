const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/(dashboard)/estimate').concat(['src/components/estimate/EstimateForm.tsx']);

files.forEach(file => {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/quotation_items/g, 'estimate_items');
  content = content.replace(/quotations/g, 'estimates');
  content = content.replace(/QuotationForm/g, 'EstimateForm');
  content = content.replace(/Quotation/g, 'Estimate');
  content = content.replace(/quotation/g, 'estimate');
  content = content.replace(/quote_number/g, 'estimate_number');
  content = content.replace(/INF-/g, 'EST-');
  
  // replace specific variables
  content = content.replace(/quoteError/g, 'estimateError');
  content = content.replace(/quotePayload/g, 'estimatePayload');
  content = content.replace(/newQuote/g, 'newEstimate');
  content = content.replace(/updatedQuote/g, 'updatedEstimate');
  content = content.replace(/quote\./g, 'estimate.');
  content = content.replace(/quote = /g, 'estimate = ');
  content = content.replace(/quote\)/g, 'estimate)');
  content = content.replace(/quote \?/g, 'estimate ?');
  content = content.replace(/!quote/g, '!estimate');
  content = content.replace(/const quote /g, 'const estimate ');
  content = content.replace(/let quote /g, 'let estimate ');
  
  fs.writeFileSync(file, content);
});
