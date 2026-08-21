import re

with open('src/components/parts/AddPartModal.tsx', 'r') as f:
    content = f.read()

# Add standard number change handler and blur handler inside the component
handler_code = """  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
      val = val.replace(/^0+/, '')
      if (val === '') val = '0'
    }
    setter(val)
  }
  
  const handleNumberBlur = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => () => {
    if (val === '') setter('0')
  }

  const handleSubmit"""
content = content.replace("  const handleSubmit", handler_code)

# Fix cost input
old_cost = """onChange={e => setCost(e.target.value)} className="w-full border border-slate-300 rounded-md p-2\""""
new_cost = """onChange={handleNumberChange(setCost)} onBlur={handleNumberBlur(cost, setCost)} onFocus={e => e.target.select()} className="w-full border border-slate-300 rounded-md p-2\""""
content = content.replace(old_cost, new_cost)

# Fix selling price input
old_sell = """onChange={e => setSellingPrice(e.target.value)} className="w-full border border-slate-300 rounded-md p-2\""""
new_sell = """onChange={handleNumberChange(setSellingPrice)} onBlur={handleNumberBlur(sellingPrice, setSellingPrice)} onFocus={e => e.target.select()} className="w-full border border-slate-300 rounded-md p-2\""""
content = content.replace(old_sell, new_sell)

with open('src/components/parts/AddPartModal.tsx', 'w') as f:
    f.write(content)
