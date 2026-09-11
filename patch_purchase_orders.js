const fs = require('fs')
let file = 'src/app/(dashboard)/purchase-orders/page.tsx'
let code = fs.readFileSync(file, 'utf8')

const oldAction = /<td className="px-4 py-3">\s*<div className="flex items-center gap-3">[\s\S]*?<\/div>\s*<\/td>/;

const newAction = `<td className="px-4 py-3">
                            <TableActions align="right">
                              <TableAction 
                                icon={Eye} 
                                label="View PO" 
                                href={\`/purchase-orders/\${po.id}\`} 
                              />
                              <TableAction 
                                icon={Printer} 
                                label="Print PO" 
                                href={\`/print/purchase-orders/\${po.id}\`} 
                              />
                            </TableActions>
                          </td>`

if (code.match(oldAction)) {
  code = code.replace(oldAction, newAction)
  fs.writeFileSync(file, code)
  console.log("Patched purchase-orders")
} else {
  console.log("Could not find match in purchase-orders")
}
