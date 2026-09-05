const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  // Find <td className="...">...₱...</td> and add text-right to the class
  const tdRegex = /<td className="([^"]*?)">([\s\S]*?)<\/td>/g;
  
  content = content.replace(tdRegex, (match, classes, inner) => {
    if (inner.includes('₱') || inner.includes('formatCurrency') || inner.includes('toLocaleString')) {
      // It's likely a money column
      // Exclude things that are clearly not just a number, like links or multiple divs?
      // Actually, if it contains ₱, it's safe to right-align the td!
      if (!classes.includes('text-right')) {
        updated = true;
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<td className="${classes} text-right">${inner}</td>`;
      }
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Aligned TDs in ${file}`);
  }
});
