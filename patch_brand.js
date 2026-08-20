const fs = require('fs');
let code = fs.readFileSync('src/components/parts/BrandSelector.tsx', 'utf8');

code = code.replace("const handleAddBrand = async (e: React.FormEvent) => {", "const handleAddBrand = async (e?: React.FormEvent | React.MouseEvent) => {\n    if (e) e.preventDefault();");
code = code.replace("<form onSubmit={handleAddBrand} className=\"p-6\">", "<div className=\"p-6\">");
code = code.replace("</form>", "</div>");
code = code.replace("onChange={(e) => {", "onKeyDown={(e) => {\n                    if (e.key === 'Enter') {\n                      e.preventDefault()\n                      handleAddBrand()\n                    }\n                  }}\n                  onChange={(e) => {");
code = code.replace("<button\n                  type=\"submit\"", "<button\n                  type=\"button\"\n                  onClick={handleAddBrand}");

fs.writeFileSync('src/components/parts/BrandSelector.tsx', code);
