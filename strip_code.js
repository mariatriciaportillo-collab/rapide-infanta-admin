const fs = require('fs')

let qid = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8')
qid = qid.replace(/\{quote\.status === 'APPROVED' && \(\s*<button onClick=\{handleCompleteService\}.*?<\/button>\s*\)\}/, '')

// And remove the `const [isUpdating, setIsUpdating] = useState(false)` etc if they are present.
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', qid)
