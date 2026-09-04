const fs = require('fs');

let path = 'src/app/(dashboard)/packages/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the query
content = content.replace(
  /\.select\('\*, package_items\([^)]+\)', \{ count: 'exact' \}\)/g,
  `.select('*', { count: 'exact' })`
);

// 2. Fix the table structure and row rendering
const tableRegex = /<table className="w-full text-left border-collapse">[\s\S]*?<\/table>/g;
const newTable = `<table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-3 font-medium">PACKAGE NAME</th>
                    <th className="px-6 py-3 font-medium">CATEGORY</th>
                    <th className="px-6 py-3 font-medium text-right">PACKAGE PRICE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Package className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No packages found.</p>
                      </td>
                    </tr>
                  ) : (
                    packages.map(pkg => {
                      const pkgPrice = pkg.package_price !== null && pkg.package_price !== undefined 
                        ? Number(pkg.package_price) 
                        : null;

                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{pkg.name}</div>
                            {pkg.package_code && <div className="text-xs font-mono text-slate-500 mt-0.5">{pkg.package_code}</div>}
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {pkg.category || '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                            {pkgPrice !== null ? \`₱\${pkgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\` : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${
                              pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }\`}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <TableActions align="right">
                              <TableAction icon={Edit} label="Edit Package" href={\`/packages/\${pkg.id}/edit\`} />
                            </TableActions>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>`;

content = content.replace(tableRegex, newTable);

fs.writeFileSync(path, content);
