const fs = require('fs');

let form = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

form = form.replace(
  /\.contains\('roles', \['Service Advisor'\]\)/g,
  `.contains('roles', ['SERVICE ADVISOR'])`
);

// We should also handle the fact that old data might be mixed case, so let's do local filtering instead to be completely safe.
