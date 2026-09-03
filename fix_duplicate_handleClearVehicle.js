const fs = require('fs');

function removeDuplicate(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find first occurrence of handleClearVehicle
  const firstIndex = content.indexOf('const handleClearVehicle = () => {');
  if (firstIndex !== -1) {
    const secondIndex = content.indexOf('const handleClearVehicle = () => {', firstIndex + 1);
    if (secondIndex !== -1) {
      // Find the end of the second block (})
      const endIndex = content.indexOf('  }', secondIndex);
      content = content.slice(0, secondIndex) + content.slice(endIndex + 3);
    }
  }
  
  fs.writeFileSync(filePath, content);
}

removeDuplicate('src/components/quotations/QuotationForm.tsx');
removeDuplicate('src/components/estimates/EstimateForm.tsx');
