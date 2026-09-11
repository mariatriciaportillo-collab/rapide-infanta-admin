const fs = require('fs')
let file = 'src/app/(dashboard)/outside-purchases/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldAction = /<td className="px-4 py-3">\s*<Link\s*href=\{\`\/outside-purchases\/\$\{p\.id\}\`\}\s*className="text-sm font-medium text-blue-600 hover:text-blue-800"\s*>\s*View\s*<\/Link>\s*<\/td>/;

const newAction = `<td className="px-4 py-3">
                            <TableActions align="right">
                              <TableAction 
                                icon={Eye} 
                                label="View Purchase" 
                                href={\`/outside-purchases/\${p.id}\`} 
                              />
                            </TableActions>
                          </td>`

if (code.match(oldAction)) {
  code = code.replace(oldAction, newAction)
  fs.writeFileSync(file, code)
  console.log("Patched outside-purchases")
} else {
  console.log("Could not find match in outside-purchases")
}
