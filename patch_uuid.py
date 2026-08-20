import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'r') as f:
        code = f.read()

    # Fix items useState
    old_state = "    { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }"
    new_state = "    { id: 'initial-row-1', partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }"
    code = code.replace(old_state, new_state)

    # Fix purchaseDate to prevent timezone hydration errors
    old_date = "const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])"
    new_date = "const [purchaseDate, setPurchaseDate] = useState('')"
    code = code.replace(old_date, new_date)

    # Update useEffect to set the date
    old_effect = """  useEffect(() => {
    fetchSuppliers()
  }, [])"""
    new_effect = """  useEffect(() => {
    setPurchaseDate(new Date().toISOString().split('T')[0])
    fetchSuppliers()
  }, [])"""
    code = code.replace(old_effect, new_effect)

    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'w') as f:
        f.write(code)

patch()
