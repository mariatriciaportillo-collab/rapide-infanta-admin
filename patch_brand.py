import re

def patch():
    with open('src/components/parts/BrandSelector.tsx', 'r') as f:
        code = f.read()

    code = code.replace("const handleAddBrand = async (e: React.FormEvent) => {", "const handleAddBrand = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {\n    if (e) e.preventDefault();")
    code = code.replace('<form onSubmit={handleAddBrand} className="p-6">', '<div className="p-6">')
    code = code.replace('</form>', '</div>')
    
    code = code.replace('onChange={(e) => {', '''onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddBrand(e)
                    }
                  }}
                  onChange={(e) => {''')

    code = code.replace('<button\n                  type="submit"', '<button\n                  type="button"\n                  onClick={handleAddBrand}')

    with open('src/components/parts/BrandSelector.tsx', 'w') as f:
        f.write(code)

patch()
