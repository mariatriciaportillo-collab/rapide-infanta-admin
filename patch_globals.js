const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');

if (!content.includes('font-size: 15px;')) {
  // Insert at the end of the file
  content += '\n\n@layer base {\n  html {\n    font-size: 15px;\n  }\n}\n';
  fs.writeFileSync('src/app/globals.css', content);
}
