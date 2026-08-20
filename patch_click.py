import re

def patch():
    with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
        code = f.read()

    # Change onClick to onMouseDown for dropdown items
    code = code.replace('''                      onClick={() => {
                        setSelectedPartId(part.id)
                        onSelectPart?.(part)
                        setIsOpen(false)
                        setSearch('')
                      }}''', '''                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        setSelectedPartId(part.id)
                        onSelectPart?.(part)
                        setIsOpen(false)
                        setSearch('')
                      }}''')
                      
    code = code.replace('''                    <button 
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        setShowAddModal(true)
                      }}''', '''                    <button 
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsOpen(false)
                        setShowAddModal(true)
                      }}''')

    code = code.replace('''                  <button 
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      setShowAddModal(true)
                    }}''', '''                  <button 
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsOpen(false)
                      setShowAddModal(true)
                    }}''')

    with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
        f.write(code)

patch()
