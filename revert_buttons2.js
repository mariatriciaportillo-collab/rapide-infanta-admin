const fs = require('fs')

let qid = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8')
// Look for where the buttons are added without the functions being added
qid = qid.replace(/\{quote\.status === 'DRAFT'[\s\S]*?Complete Service\n\s*<\/button>\n\s*\)\}/g, `<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={18} />
            Mark Approved
          </button>`)
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', qid)
