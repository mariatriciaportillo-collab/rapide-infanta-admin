const fs = require('fs');
const path = require('path');
const glob = require('glob');

const skipDirs = ['[id]', 'new', 'edit', 'print', 'receipt', 'import'];

// Find all page.tsx files
const pages = glob.sync('src/app/(dashboard)/**/page.tsx');

let updatedFiles = 0;

pages.forEach(file => {
  const dirParts = path.dirname(file).split('/');
  const isSkip = dirParts.some(part => skipDirs.includes(part));
  if (isSkip) return;
  // Also skip dashboard home
  if (file === 'src/app/(dashboard)/page.tsx') return;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // 1. Title formatting
  content = content.replace(/<h[123] className="text-3xl font-bold[^>]*>(.*?)<\/h[123]>/g, '<h1 className="text-2xl font-bold text-slate-800">$1</h1>');
  content = content.replace(/<h2 className="text-2xl font-bold[^>]*>(.*?)<\/h2>/g, '<h1 className="text-2xl font-bold text-slate-800">$1</h1>');
  
  // 2. Main wrapper standardization (looking for the first div after return)
  // Most pages start with: return (\n  <div ...>
  // We'll try to find the return statement and replace the immediate wrapper.
  const returnMatch = content.match(/return\s*\(\s*<div([^>]*)>/);
  if (returnMatch) {
    const currentClasses = returnMatch[1];
    // Replace the first div
    content = content.replace(returnMatch[0], 'return (\n    <div className="p-6 max-w-7xl mx-auto">');
  }

  // 3. Primary Button standardization (bg-blue-600 ...)
  // e.g. className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
  // We want to add flex, items-center, gap-2, shadow-sm if not present, and ensure it looks unified.
  // Actually, using a generic regex:
  content = content.replace(/className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium[^"]*"/g, (match) => {
    let classes = match.replace('className="', '').replace('"', '').split(' ');
    const addClasses = ['flex', 'items-center', 'gap-2', 'shadow-sm', 'transition'];
    addClasses.forEach(c => {
      if (!classes.includes(c)) classes.push(c);
    });
    return `className="${classes.join(' ')}"`;
  });

  // 4. Table Container
  content = content.replace(/className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden[^"]*"/g, 'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"');
  
  // 5. Table Header (thead)
  // Remove uppercase text-xs
  content = content.replace(/className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200"/g, 'className="bg-slate-50 text-slate-500 border-b border-slate-200"');
  
  // 6. Table Headers (th)
  // We want them to have font-semibold and text-sm (or inherit from table). Table has text-sm.
  content = content.replace(/<th className="px-4 py-3">/g, '<th className="px-4 py-3 font-semibold">');
  content = content.replace(/<th className="px-6 py-3">/g, '<th className="px-4 py-3 font-semibold">');
  
  // Table Rows (td padding)
  content = content.replace(/<td className="px-6 py-4">/g, '<td className="px-4 py-3">');
  
  // Table row height (divide-y and hover)
  content = content.replace(/<tbody className="divide-y divide-slate-200">/g, '<tbody className="divide-y divide-slate-100">');
  content = content.replace(/<tr key=\{([^\}]+)\} className="hover:bg-slate-50 transition">/g, '<tr key={$1} className="hover:bg-slate-50">');
  
  // Fix table tag
  content = content.replace(/<table className="w-full text-left text-sm text-slate-600">/g, '<table className="w-full text-left text-sm whitespace-nowrap">');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Updated ${updatedFiles} files.`);
