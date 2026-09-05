const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  const thRegex = /<th className="([^"]*?)">(\s*Action\s*|\s*Actions\s*)<\/th>/ig;
  content = content.replace(thRegex, (match, classes, inner) => {
    if (!classes.includes('text-right')) {
      updated = true;
      classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
      return `<th className="${classes} text-right w-16">${inner}</th>`;
    }
    return match;
  });

  // For the Action cell, it usually contains TableActions or something similar
  const tdRegex = /<td className="([^"]*?)">([\s\S]*?)<\/td>/g;
  content = content.replace(tdRegex, (match, classes, inner) => {
    if (inner.includes('<TableActions') || inner.includes('TableAction ') || (inner.includes('<Link') && inner.includes('Edit') && classes.includes('w-16'))) {
      if (!classes.includes('text-right')) {
        updated = true;
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<td className="${classes} text-right">${inner}</td>`;
      }
    }
    // Also if it has align="center", change to align="right" for TableActions
    if (inner.includes('<TableActions align="center"')) {
       inner = inner.replace('<TableActions align="center"', '<TableActions align="right"');
       updated = true;
       return `<td className="${classes}">${inner}</td>`;
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Aligned Actions in ${file}`);
  }
});
