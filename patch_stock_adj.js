const fs = require('fs')
let file = 'src/app/(dashboard)/stock-adjustments/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldAction = /<td className="px-4 py-3">\s*<Link\s*href=\{t\.type === 'SWAP' \? \`\/stock-swaps\/\$\{t\.id\}\` : \`\/stock-adjustments\/\$\{t\.id\}\`\}\s*className="text-sm font-medium text-blue-600 hover:text-blue-800"\s*>\s*View\s*<\/Link>\s*<\/td>/;

const newAction = `<td className="px-4 py-3">
                            <TableActions align="right">
                              <TableAction 
                                icon={Eye} 
                                label="View Transaction" 
                                href={t.type === 'SWAP' ? \`/stock-swaps/\${t.id}\` : \`/stock-adjustments/\${t.id}\`} 
                              />
                            </TableActions>
                          </td>`

if (code.match(oldAction)) {
  code = code.replace(oldAction, newAction)
  fs.writeFileSync(file, code)
  console.log("Patched stock-adjustments")
} else {
  console.log("Could not find match in stock-adjustments")
}
