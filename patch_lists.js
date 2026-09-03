const fs = require('fs');

function patchList(filePath, isEstimate) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove Action header
  content = content.replace(/<th className="px-4 py-3 text-right">Actions<\/th>/, '');
  
  // Replace reference number cell to be clickable
  if (isEstimate) {
    content = content.replace(/<td className="px-4 py-3 font-medium text-slate-900">\{q\.estimate_number\}<\/td>/, '<td className="px-4 py-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"><Link href={`/estimates/${q.id}`}>{q.estimate_number}</Link></td>');
  } else {
    content = content.replace(/<td className="px-4 py-3 font-medium text-slate-900">\{q\.quote_number\}<\/td>/, '<td className="px-4 py-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"><Link href={`/quotations/${q.id}`}>{q.quote_number}</Link></td>');
  }
  
  // Remove the actions column TD
  // We need a regex that captures from `<td className="px-4 py-3 text-right space-x-3">` until the matching `</td>`
  const tdRegex = /<td className="px-4 py-3 text-right space-x-3">[\s\S]*?<\/td>/;
  content = content.replace(tdRegex, '');
  
  // Adjust colspan for empty state
  content = content.replace(/colSpan=\{7\}/g, 'colSpan={6}');

  fs.writeFileSync(filePath, content);
}

patchList('src/app/(dashboard)/quotations/page.tsx', false);
patchList('src/app/(dashboard)/estimates/page.tsx', true);
