const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  // Many badges look like: <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
  // Or: <span className={`px-2 py-1 rounded text-xs font-bold ${...}`}
  // We want to replace these with: inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase
  
  // Regex to catch <span className={...}> where it has some badge-like classes
  const spanRegex = /<span className=\{`([^`]+)`\}/g;
  content = content.replace(spanRegex, (match, classes) => {
    if (classes.includes('px-2') && classes.includes('py-1') && (classes.includes('rounded') || classes.includes('rounded-full'))) {
      updated = true;
      // Strip out the old typography and spacing
      let newClasses = classes.replace(/\b(text-xs|text-sm|font-medium|font-bold|font-semibold|tracking-wider|uppercase|rounded-full|rounded|inline-block|inline-flex|px-2|py-1|px-2\.5)\b/g, '').replace(/\s+/g, ' ').trim();
      
      // Ensure the standardized classes are at the start
      return `<span className={\`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase \${'${newClasses}'}\`}`;
    }
    return match;
  });
  
  // Also catch simple string badges like <span className="px-2 py-1 ...">
  const spanStrRegex = /<span className="([^"]+)"/g;
  content = content.replace(spanStrRegex, (match, classes) => {
    if (classes.includes('px-2') && classes.includes('py-1') && (classes.includes('rounded') || classes.includes('rounded-full')) && (classes.includes('bg-') || classes.includes('text-'))) {
      updated = true;
      let newClasses = classes.replace(/\b(text-xs|text-sm|font-medium|font-bold|font-semibold|tracking-wider|uppercase|rounded-full|rounded|inline-block|inline-flex|px-2|py-1|px-2\.5)\b/g, '').replace(/\s+/g, ' ').trim();
      return `<span className="inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${newClasses}"`;
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Standardized badges in ${file}`);
  }
});
