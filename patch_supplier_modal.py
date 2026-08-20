import re

def patch():
    with open('src/components/suppliers/SupplierModal.tsx', 'r') as f:
        code = f.read()

    # 1. Add createPortal to imports
    code = code.replace("import React, { useState } from 'react'", "import React, { useState, useEffect } from 'react'\nimport { createPortal } from 'react-dom'")
    
    # 2. Add mounted state to prevent hydration mismatch and use createPortal
    old_return = """  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">"""
    
    new_return = """  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">"""
    
    code = code.replace(old_return, new_return)
    
    # 3. Add closing paren to the return statement
    code = code.replace("    </div>\n  )\n}", "    </div>,\n    document.body\n  )\n}")

    with open('src/components/suppliers/SupplierModal.tsx', 'w') as f:
        f.write(code)

patch()
