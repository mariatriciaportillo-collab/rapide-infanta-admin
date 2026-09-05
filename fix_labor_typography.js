const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/labor-charges/LaborChargesClient.tsx', 'utf8');

// 1. Labor / Service Name
// <div className="font-bold text-slate-800">{service.name}</div>
c = c.replace(/<div className="font-bold text-slate-800">\{service\.name\}<\/div>/g, '<div className="font-medium text-slate-900">{service.name}</div>');

// 2. Group
// <td className="px-4 py-3 font-medium text-slate-700">
// {service.labor_groups?.name || '-'}
// </td>
c = c.replace(/<td className="px-4 py-3 font-medium text-slate-700">\s*\{service\.labor_groups\?\.name \|\| '-'\}/g, '<td className="px-4 py-3 text-slate-600">\n                          {service.labor_groups?.name || <span className="text-slate-400">—</span>}');

// 3. Category
// <td className="px-4 py-3 text-slate-600">
// {service.labor_categories?.name || '-'}
c = c.replace(/<td className="px-4 py-3 text-slate-600">\s*\{service\.labor_categories\?\.name \|\| '-'\}/g, '<td className="px-4 py-3 text-slate-600">\n                          {service.labor_categories?.name || <span className="text-slate-400">—</span>}');

// 4. Std. Hrs
// <td className="px-4 py-3 text-right text-slate-600">
// {service.standard_hours ? service.standard_hours.toFixed(1) : '-'}
c = c.replace(/\{service\.standard_hours \? service\.standard_hours\.toFixed\(1\) : '-'\}/g, "{service.standard_hours ? service.standard_hours.toFixed(1) : <span className=\"text-slate-400\">—</span>}");

// 5. Rate
// <td className="px-4 py-3 text-right font-bold text-slate-700">
c = c.replace(/<td className="px-4 py-3 text-right font-bold text-slate-700">/g, '<td className="px-4 py-3 text-right text-slate-600">');

// Also update formatCurrency to return a muted placeholder when empty
c = c.replace(/if \(val === null \|\| val === undefined\) return '-'/g, "if (val === null || val === undefined) return <span className=\"text-slate-400\">—</span>");
c = c.replace(/const formatCurrency = \(val: number \| null \| undefined\) => \{/g, "const formatCurrency = (val: number | null | undefined): React.ReactNode => {");


// 6. Status Badge
c = c.replace(/<span className=\{`px-2 py-1 rounded text-xs font-semibold \$\{service\.is_active \? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'\}`\}>/g, '<span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${service.is_active ? \'bg-emerald-50 text-emerald-700 border border-emerald-200\' : \'bg-slate-100 text-slate-700 border border-slate-200\'}`}>');

fs.writeFileSync('src/app/(dashboard)/labor-charges/LaborChargesClient.tsx', c);
console.log('Fixed LaborChargesClient typography');
