const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  // Search for the broken \${'${...}'} pattern
  const brokenRegex = /uppercase \$\{'(\$\{.*?\})'\}\`/g;
  content = content.replace(brokenRegex, (match, inner) => {
    updated = true;
    return `uppercase ${inner}\``;
  });

  // Also catch \${'${...}'} without backticks?
  const brokenRegex2 = /\$\{'(\$\{.*?\})'\}/g;
  content = content.replace(brokenRegex2, (match, inner) => {
    updated = true;
    return inner;
  });

  // Also fix `<span className="inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${...}"` which should use backticks!
  // E.g. <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${status.color}"
  const badQuoteRegex = /<span className="([^"]*\$\{.*?\}[^"]*)"/g;
  content = content.replace(badQuoteRegex, (match, inner) => {
    updated = true;
    return `<span className={\`${inner}\`}`;
  });

  // Wait, I messed up `inventory/page.tsx` line 317?
  // `tracking-wide border ${status.color.replace('bg-', 'border-').replace('-100', '-200')} ${...}`
  
  // Let's just fix anything with `\${'${`
  const brokenRegex3 = /\$\{'(\$\{.*?\}|[^']+)'\}/g;
  content = content.replace(brokenRegex3, (match, inner) => {
    updated = true;
    if (inner.startsWith('${')) return inner;
    return `\${${inner}}`;
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Fixed badges in ${file}`);
  }
});
