import re

def patch():
    with open('src/components/parts/AddPartModal.tsx', 'r') as f:
        code = f.read()

    code = code.replace("const handleSubmit = async (e: React.FormEvent) => {", "const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {\n    if (e) e.preventDefault();")
    code = code.replace('<form id="add-part-form" onSubmit={handleSubmit} className="space-y-6">', '<div className="space-y-6">')
    code = code.replace('</form>', '</div>')
    
    code = code.replace('<button type="submit" form="add-part-form"', '<button type="button" onClick={handleSubmit}')

    with open('src/components/parts/AddPartModal.tsx', 'w') as f:
        f.write(code)

patch()
