import re

def patch():
    with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
        code = f.read()

    # Make the input rounded-b-none when open, remove border-bottom when open, etc.
    old_input_div = """        <div 
          className={`w-full h-[42px] px-3 border bg-white flex justify-between items-center transition rounded-md ${
            disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-slate-400'
          } ${
            isOpen ? 'border-blue-500 ring-1 ring-blue-500' : (error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300')
          }`}"""
          
    new_input_div = """        <div 
          className={`w-full h-[42px] px-3 border bg-white flex justify-between items-center transition ${
            isOpen ? 'rounded-t-md border-blue-500 ring-1 ring-blue-500 z-10 relative' : 'rounded-md ' + (error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300')
          } ${
            disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-slate-400'
          }`}"""
    code = code.replace(old_input_div, new_input_div)

    # Make the dropdown attach seamlessly
    old_dropdown = """        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 z-[60] w-full bg-white border border-slate-300 rounded-md shadow-lg flex flex-col overflow-hidden" style={{ maxHeight: '320px' }}>"""
          
    new_dropdown = """        {isOpen && (
          <div className="absolute top-full left-0 z-[70] w-full bg-white border border-t-0 border-blue-500 rounded-b-md shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: '320px', marginTop: '-1px' }}>"""
    code = code.replace(old_dropdown, new_dropdown)

    with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
        f.write(code)

patch()
