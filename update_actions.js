const fs = require('fs');

const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react'/;
function ensureImports(content, icons) {
  const match = content.match(importRegex);
  if (match) {
    let existingIcons = match[1].split(',').map(s => s.trim());
    let newIcons = icons.filter(i => !existingIcons.includes(i));
    if (newIcons.length > 0) {
      const newImportString = `import { ${existingIcons.concat(newIcons).join(', ')} } from 'lucide-react'`;
      content = content.replace(importRegex, newImportString);
    }
  }
  if (!content.includes('TableActions')) {
    content = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + content;
  }
  return content;
}

function processFile(path, modifierFn) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    const newContent = modifierFn(content);
    if (newContent !== content) {
      fs.writeFileSync(path, newContent);
      console.log('Updated', path);
    } else {
      console.log('No changes in', path);
    }
  } else {
    console.log('File not found', path);
  }
}

// 1. part-labor-rules/page.tsx
processFile('src/app/(dashboard)/part-labor-rules/page.tsx', (content) => {
  content = ensureImports(content, ['Edit2', 'Trash2']);
  const regex = /<div className="flex justify-center gap-3">[\s\S]*?<Link href=\{`\/part-labor-rules\/\$\{rule\.id\}\/edit`\}[\s\S]*?<Edit2 size=\{16\} \/>[\s\S]*?<\/Link>[\s\S]*?<button onClick=\{.*?\}[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>/g;
  const replacement = `<TableActions align="center">
                        <TableAction icon={Edit2} label="Edit Rule" href={\`/part-labor-rules/\${rule.id}/edit\`} />
                        <TableAction icon={Trash2} label="Delete Rule" onClick={() => handleDelete(rule.id, rule.rule_name)} variant="destructive" />
                      </TableActions>`;
  return content.replace(regex, replacement);
});

// 2. payments/page.tsx
processFile('src/app/(dashboard)/payments/page.tsx', (content) => {
  content = ensureImports(content, ['Printer', 'Banknote']);
  
  // Tab 1: Downpayments
  const regexDP = /\{\(q\.downpayment_status === 'PAID' \|\| Number\(q\.downpayment_paid_amount\) >= Number\(q\.required_downpayment_amount\)\) \? \([\s\S]*?<Link href=\{`\/quotations\/\$\{q\.id\}\/receipt`\}[\s\S]*?<Printer size=\{18\} \/>[\s\S]*?<\/Link>[\s\S]*?\) : \([\s\S]*?<button onClick=\{.*?\}[\s\S]*?>[\s\S]*?Record Downpayment[\s\S]*?<\/button>[\s\S]*?\)\}/g;
  const repDP = `<TableActions align="center">
                          {(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? (
                            <TableAction icon={Printer} label="Print Downpayment Receipt" href={\`/quotations/\${q.id}/receipt\`} />
                          ) : (
                            <TableAction icon={Banknote} label="Record Downpayment" onClick={() => handleOpenModal(q)} variant="success" />
                          )}
                        </TableActions>`;
  content = content.replace(regexDP, repDP);

  // Tab 2: History
  const regexHist = /<td className="px-4 py-3 text-center">[\s\S]*?<Link[\s\S]*?href=\{`\/invoice\/\$\{payment\.invoice_id\}\/receipt`\}[\s\S]*?>[\s\S]*?<Printer size=\{16\} \/> Print Receipt[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const repHist = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          <TableAction icon={Printer} label="Print Receipt" href={\`/invoice/\${payment.invoice_id}/receipt\`} />
                        </TableActions>
                      </td>`;
  content = content.replace(regexHist, repHist);

  // Replace text-right header if any
  content = content.replace(/<th className="px-4 py-3 text-right">Action<\/th>/g, '<th className="px-4 py-3 text-center">Action</th>');

  return content;
});

// 3. admin/service-intervals/page.tsx
processFile('src/app/(dashboard)/admin/service-intervals/page.tsx', (content) => {
  content = ensureImports(content, ['Edit2', 'Trash2']);
  const regex = /<div className="flex justify-center gap-3">[\s\S]*?<button onClick=\{.*setEditingId.*?\}[\s\S]*?<Edit2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<button onClick=\{.*handleDelete.*?\}[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>/g;
  const replacement = `<TableActions align="center">
                          <TableAction icon={Edit2} label="Edit Interval" onClick={() => {
                            setEditingId(interval.id)
                            setEditName(interval.name)
                            setEditMonths(interval.months || '')
                            setEditKm(interval.kilometers || '')
                          }} />
                          <TableAction icon={Trash2} label="Delete Interval" onClick={() => handleDelete(interval.id, interval.name)} variant="destructive" />
                        </TableActions>`;
  return content.replace(regex, replacement);
});

// 4. admin/employees/page.tsx
processFile('src/app/(dashboard)/admin/employees/page.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/admin\/employees\/\$\{employee\.id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/> Edit[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Employee" href={\`/admin/employees/\${employee.id}/edit\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 5. quick-sale/page.tsx
processFile('src/app/(dashboard)/quick-sale/page.tsx', (content) => {
  content = ensureImports(content, ['Printer']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/quick-sale\/\$\{qs\.id\}\/receipt`\}[\s\S]*?>[\s\S]*?<Printer size=\{16\} \/> Print Receipt[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Printer} label="Print Receipt" href={\`/quick-sale/\${qs.id}/receipt\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 6. packages/page.tsx
processFile('src/app/(dashboard)/packages/page.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/packages\/\$\{pkg\.id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/> Edit[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Package" href={\`/packages/\${pkg.id}/edit\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 7. parts/page.tsx
processFile('src/app/(dashboard)/parts/page.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/parts\/\$\{part\.id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/> Edit[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Part" href={\`/parts/\${part.id}/edit\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 8. invoice/page.tsx
processFile('src/app/(dashboard)/invoice/page.tsx', (content) => {
  content = ensureImports(content, ['Printer', 'Eye', 'Banknote']);
  const regex = /<td className="px-4 py-3 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/invoice\/\$\{invoice\.id\}`\}[\s\S]*?>[\s\S]*?View[\s\S]*?<\/Link>[\s\S]*?<Link[\s\S]*?href=\{`\/invoice\/\$\{invoice\.id\}\/print`\}[\s\S]*?>[\s\S]*?<Printer size=\{16\} \/> Print[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-4 py-3 text-right">
                      <TableActions align="right">
                        <TableAction icon={Eye} label="View Invoice" href={\`/invoice/\${invoice.id}\`} />
                        <TableAction icon={Printer} label="Print Invoice" href={\`/invoice/\${invoice.id}/print\`} />
                      </TableActions>
                    </td>`;
  let c = content.replace(regex, rep);
  
  // also check if there's payment action
  const reg2 = /<td className="px-4 py-3 text-center">[\s\S]*?Record Payment[\s\S]*?<\/button>[\s\S]*?<\/td>/;
  if (reg2.test(c)) {
    // maybe we handle that later if it exists
  }
  return c;
});

