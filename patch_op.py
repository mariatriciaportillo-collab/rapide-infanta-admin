import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'r') as f:
        code = f.read()

    # Fix the handleUpdateItem to use functional state updates
    old_update = """  const handleUpdateItem = (id: string, field: keyof OPItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'part' && value) {
          return { ...item, part: value, unitCost: value.cost ? value.cost.toString() : '' }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }"""
    
    new_update = """  const handleUpdateItem = (id: string, field: keyof OPItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (field === 'part' && value) {
          return { ...item, part: value, unitCost: value.cost ? value.cost.toString() : '' }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }"""
    code = code.replace(old_update, new_update)

    # Also fix handleAddItem to use functional update to be safe
    old_add = """  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }])
  }"""
    new_add = """  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }])
  }"""
    code = code.replace(old_add, new_add)

    # Fix the button disabled state
    old_btn = """<button 
                type="submit" 
                disabled={isSubmitting || items.some(i => !i.partId)}"""
    new_btn = """<button 
                type="submit" 
                disabled={isSubmitting}"""
    code = code.replace(old_btn, new_btn)

    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'w') as f:
        f.write(code)

patch()
