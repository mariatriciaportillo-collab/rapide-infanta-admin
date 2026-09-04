const fs = require('fs');
const quote = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const regexCustomerModal = /\{\/\* CUSTOMER MODAL \*\/\}[\\s\\S]*?\{\/\* VEHICLE MODAL \*\/\}[\\s\\S]*?\)/;
const match = quote.match(regexCustomerModal);
if (match) {
  fs.writeFileSync('modals.txt', match[0]);
  console.log('Got modals');
} else {
  console.log('No match for modals');
}
