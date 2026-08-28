const fs = require('fs')
const path = require('path')

const sections = ['users', 'branch']

sections.forEach(sec => {
  const dir = path.join('src/app/(dashboard)/admin', sec)
  fs.mkdirSync(dir, { recursive: true })
  
  const title = sec.charAt(0).toUpperCase() + sec.slice(1)
  
  const content = `export default function AdminPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">${title === 'Branch' ? 'Branch Settings' : 'Users & Access'}</h1>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 text-center text-slate-500">
        This administration section is currently under construction.
      </div>
    </div>
  )
}
`
  fs.writeFileSync(path.join(dir, 'page.tsx'), content)
})
