const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const oldRemove = `  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }`;

const newRemove = `  const removeItem = (id: string) => {
    // If we are removing a package (or any item that might act as a parent), 
    // we should also remove any child items (PACKAGE_ITEM) that belong to it.
    setItems(items.filter(i => i.id !== id && i.parent_item_id !== id))
  }`;

if (file.includes(oldRemove)) {
  file = file.replace(oldRemove, newRemove);
  fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
}
