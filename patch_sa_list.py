import re

def patch():
    with open('src/app/(dashboard)/stock-adjustments/page.tsx', 'r') as f:
        code = f.read()

    # Update onClick and Link to route SWAP to /stock-swaps/[id]
    old_row = """                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = `/stock-adjustments/${t.id}`}>
                      <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={`/stock-adjustments/${t.id}`}>{t.reference_number}</Link>
                      </td>"""
                      
    new_row = """                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = t.type === 'SWAP' ? `/stock-swaps/${t.id}` : `/stock-adjustments/${t.id}`}>
                      <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={t.type === 'SWAP' ? `/stock-swaps/${t.id}` : `/stock-adjustments/${t.id}`}>{t.reference_number}</Link>
                      </td>"""
                      
    code = code.replace(old_row, new_row)

    with open('src/app/(dashboard)/stock-adjustments/page.tsx', 'w') as f:
        f.write(code)

patch()
