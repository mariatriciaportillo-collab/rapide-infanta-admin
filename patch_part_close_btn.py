import re

def patch():
    with open('src/components/parts/AddPartModal.tsx', 'r') as f:
        code = f.read()

    code = code.replace(
        '<button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">',
        '<button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">'
    )

    with open('src/components/parts/AddPartModal.tsx', 'w') as f:
        f.write(code)

patch()
