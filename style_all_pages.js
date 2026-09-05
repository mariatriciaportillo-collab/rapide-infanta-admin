const fs = require('fs');
const glob = require('glob');

const skipDirs = ['[id]', 'new', 'edit', 'print', 'receipt', 'import'];

const pages = glob.sync('src/app/(dashboard)/**/page.tsx').filter(file => {
  const dirParts = file.split('/');
  const isSkip = dirParts.some(part => skipDirs.includes(part));
  return !isSkip && file !== 'src/app/(dashboard)/page.tsx';
});

// We want to force specific class replacements
const replaceClasses = (content) => {
  // 1. Title/Subtitle
  content = content.replace(/<h[23] className="text-3xl[^>]*>(.*?)<\/h[23]>/g, '<h1 className="text-2xl font-bold text-slate-800">$1</h1>');
  content = content.replace(/<h1 className="text-3xl[^>]*>(.*?)<\/h1>/g, '<h1 className="text-2xl font-bold text-slate-800">$1</h1>');
  
  // 2. Primary Button
  content = content.replace(/className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium[^"]*"/g, (match) => {
    let cls = match.replace('className="', '').replace('"', '').split(' ');
    const addClasses = ['flex', 'items-center', 'gap-2', 'shadow-sm', 'transition'];
    addClasses.forEach(c => { if (!cls.includes(c)) cls.push(c); });
    return `className="${cls.join(' ')}"`;
  });

  // 3. Main Container
  const returnMatch = content.match(/return\s*\(\s*<div([^>]*)>/);
  if (returnMatch && !returnMatch[1].includes('p-6 max-w-7xl mx-auto')) {
    content = content.replace(returnMatch[0], 'return (\n    <div className="p-6 max-w-7xl mx-auto">');
  }

  // 4. Table Container
  content = content.replace(/className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden[^"]*"/g, 'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"');
  
  // 5. Table Header
  content = content.replace(/<thead[^>]*>/g, '<thead className="bg-slate-50 text-slate-500 border-b border-slate-200">');
  
  // 6. Table row formatting
  content = content.replace(/<table className="[^"]*"/g, '<table className="w-full text-left text-sm whitespace-nowrap"');
  content = content.replace(/<tbody[^>]*>/g, '<tbody className="divide-y divide-slate-100">');
  content = content.replace(/<tr key=\{([^\}]+)\} className="hover:bg-slate-50[^"]*"/g, '<tr key={$1} className="hover:bg-slate-50">');
  // For static mapped trs without key inline class matches
  content = content.replace(/<tr className="hover:bg-slate-50 transition"/g, '<tr className="hover:bg-slate-50"');
  
  // 7. Cells padding
  content = content.replace(/px-6 py-3/g, 'px-4 py-3');
  content = content.replace(/px-6 py-4/g, 'px-4 py-3');
  
  // 8. Headers font
  content = content.replace(/<th className="([^"]*?)">/g, (match, classes) => {
    if (!classes.includes('font-semibold')) {
      classes = classes.replace('font-medium', '').replace('font-bold', '').trim();
      return `<th className="${classes} font-semibold">`;
    }
    return match;
  });

  // 9. Remove big empty states illustrations
  content = content.replace(/<div className="flex justify-center mb-3"><[A-Za-z0-9_]+\s+className="text-slate-300"\s+size=\{40\}\s*\/><\/div>\n/g, '');
  content = content.replace(/px-6 py-12/g, 'px-4 py-8 text-center text-slate-500');

  return content;
}

const alignMoney = (content) => {
  const words = ['Total', 'Amount', 'Price', 'Cost', 'Grand Total', 'Subtotal', 'Paid', 'Balance', 'Total Paid'];
  words.forEach(word => {
    // Standardize th
    const thRegex = new RegExp(`<th className="([^"]*?)">\\s*${word}\\s*<\\/th>`, 'ig');
    content = content.replace(thRegex, (match, classes) => {
      classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
      if (!classes.includes('text-right')) classes += ' text-right';
      return `<th className="${classes}">${word}</th>`;
    });
  });

  // td containing money
  const tdRegex = /<td className="([^"]*?)">([\s\S]*?)<\/td>/g;
  content = content.replace(tdRegex, (match, classes, inner) => {
    if (inner.includes('₱') || inner.includes('toLocaleString')) {
      if (!classes.includes('text-right')) {
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<td className="${classes} text-right">${inner}</td>`;
      }
    }
    return match;
  });

  return content;
}

const alignActions = (content) => {
  const thRegex = /<th className="([^"]*?)">(\s*Action\s*|\s*Actions\s*)<\/th>/ig;
  content = content.replace(thRegex, (match, classes, inner) => {
    classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
    if (!classes.includes('text-right')) classes += ' text-right';
    if (!classes.includes('w-16')) classes += ' w-16';
    return `<th className="${classes}">${inner}</th>`;
  });

  const tdRegex = /<td className="([^"]*?)">([\s\S]*?)<\/td>/g;
  content = content.replace(tdRegex, (match, classes, inner) => {
    if (inner.includes('<TableActions') || inner.includes('TableAction ') || (inner.includes('<Link') && inner.includes('Edit') && classes.includes('w-16'))) {
      if (!classes.includes('text-right')) {
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<td className="${classes} text-right">${inner}</td>`;
      }
    }
    if (inner.includes('<TableActions align="center"')) {
       inner = inner.replace('<TableActions align="center"', '<TableActions align="right"');
       return `<td className="${classes}">${inner}</td>`;
    }
    return match;
  });

  return content;
}

const formatBadges = (content) => {
  // Be safe, do NOT use regex groups inside template strings
  // Standard badge: className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ...`}
  
  // For parts/page.tsx:
  // <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
  const rx1 = /<span className=\{`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider([\s\S]*?)`\}/g;
  content = content.replace(rx1, '<span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase$1`}');
  
  return content;
}

pages.forEach(file => {
  let original = fs.readFileSync(file, 'utf8');
  let c = original;
  
  c = replaceClasses(c);
  c = alignMoney(c);
  c = alignActions(c);
  c = formatBadges(c);
  
  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log(`Styled ${file}`);
  }
});

