const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  // We want to find <th className="...">Total</th> and make it <th className="... text-right">Total</th>
  // But wait, it's safer to do this with regex.
  const monetaryWords = ['Total', 'Amount', 'Price', 'Cost', 'Grand Total', 'Subtotal', 'Paid', 'Balance', 'Total Paid'];
  
  monetaryWords.forEach(word => {
    // For th
    const thRegex = new RegExp(`<th className="([^"]*?)">\\s*${word}\\s*<\\/th>`, 'g');
    content = content.replace(thRegex, (match, classes) => {
      if (!classes.includes('text-right')) {
        updated = true;
        // remove text-center or text-left if present
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<th className="${classes} text-right">${word}</th>`;
      }
      return match;
    });
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Aligned headers in ${file}`);
  }
});
