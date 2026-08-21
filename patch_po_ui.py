import re

# 1. Fix the main page click behavior
with open('src/app/(dashboard)/purchase-orders/page.tsx', 'r') as f:
    page = f.read()

# Remove onClick from tr
page = re.sub(
    r'<tr key=\{po\.id\} className="hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 last:border-0" onClick=\{.*?\}\>',
    r'<tr key={po.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">',
    page
)

# Replace the PO Number Link with plain text
old_td = """<td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={`/purchase-orders/${po.id}`}>{po.po_number}</Link>
                      </td>"""
new_td = """<td className="px-6 py-4 font-bold text-slate-800">
                        {po.po_number}
                      </td>"""
page = page.replace(old_td, new_td)

with open('src/app/(dashboard)/purchase-orders/page.tsx', 'w') as f:
    f.write(page)


# 2. Fix the Print Error by removing the bad relation
with open('src/app/print/purchase-orders/[id]/page.tsx', 'r') as f:
    print_page = f.read()

bad_relation = """          ),
          auth_users:created_by(email)"""
good_relation = """          )"""
print_page = print_page.replace(bad_relation, good_relation)

# Optional: Output the error nicely if there is one
error_handling = """      if (data) {
        setPo(data)
      }
      setLoading(false)
    }"""
new_error_handling = """      if (error) {
        console.error("Print Error:", error)
      }
      if (data) {
        setPo(data)
      }
      setLoading(false)
    }"""
print_page = print_page.replace(error_handling, new_error_handling)

with open('src/app/print/purchase-orders/[id]/page.tsx', 'w') as f:
    f.write(print_page)
