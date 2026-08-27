import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

# Make sure we add lucide-react Edit icon
content = content.replace(
    "import { ArrowLeft, Printer, Download, CheckCircle2, FileText, User as UserIcon, Building2, Car } from 'lucide-react'",
    "import { ArrowLeft, Printer, Download, CheckCircle2, FileText, User as UserIcon, Building2, Car, Edit } from 'lucide-react'"
)

btn_old = """          <Link 
            href={`/quotations/${quote.id}/print`}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Printer size={18} />
            Print Quote
          </Link>"""

btn_new = """          {quote.status === 'draft' && (
            <Link 
              href={`/quotations/${quote.id}/edit`}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Edit size={18} />
              Edit
            </Link>
          )}
          <Link 
            href={`/quotations/${quote.id}/print`}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Printer size={18} />
            Print Quote
          </Link>"""

content = content.replace(btn_old, btn_new)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
