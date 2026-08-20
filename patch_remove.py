import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'r') as f:
        code = f.read()

    old_rm = """  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }"""
    
    new_rm = """  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }"""
    code = code.replace(old_rm, new_rm)

    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'w') as f:
        f.write(code)

patch()
