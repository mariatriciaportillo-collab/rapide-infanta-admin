import re

def patch():
    # 1. Stock Adjustments
    file_path = 'src/app/(dashboard)/stock-adjustments/new/page.tsx'
    with open(file_path, 'r') as f:
        code = f.read()

    # Search for the row container: <div key={item.id} className={`p-4 rounded-lg border relative
    old_row = "                  <div key={item.id} className={`p-4 rounded-lg border relative ${isError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>\n"
    new_row = "                  <div key={item.id} className={`p-4 rounded-lg border relative ${isError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`} style={{ zIndex: items.length - index }}>\n"
    
    code = code.replace(old_row, new_row)

    with open(file_path, 'w') as f:
        f.write(code)

    # 2. Purchase Orders
    file_path2 = 'src/app/(dashboard)/purchase-orders/new/page.tsx'
    with open(file_path2, 'r') as f:
        code2 = f.read()

    old_row2 = '                <div key={item.id} className="p-4 rounded-lg border bg-slate-50 border-slate-200">\n'
    new_row2 = '                <div key={item.id} className="p-4 rounded-lg border bg-slate-50 border-slate-200 relative" style={{ zIndex: items.length - index }}>\n'
    
    code2 = code2.replace(old_row2, new_row2)

    with open(file_path2, 'w') as f:
        f.write(code2)

patch()
