import re

def patch():
    files = [
        'src/app/(dashboard)/stock-adjustments/new/page.tsx',
        'src/app/(dashboard)/purchase-orders/new/page.tsx'
    ]
    for file_path in files:
        with open(file_path, 'r') as f:
            code = f.read()

        # Remove overflow-hidden from the main card containers
        code = code.replace(
            'className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"',
            'className="bg-white border border-slate-200 rounded-lg shadow-sm"'
        )
        
        # In PO new: <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 overflow-hidden"> 
        # (Wait, let's just do a regex for overflow-hidden on the cards, but in PO it might just be p-6)
        code = code.replace(
            'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"',
            'className="bg-white rounded-lg shadow-sm border border-slate-200"'
        )

        with open(file_path, 'w') as f:
            f.write(code)

patch()
