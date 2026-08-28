import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace my broken buttons with the original dummy button
bad_buttons = r"""\{quote\.status === 'DRAFT' && \([\s\S]*?<\/button>\n\s*\)\}"""
content = re.sub(bad_buttons, r"""<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={18} />
            Mark Approved
          </button>""", content)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
