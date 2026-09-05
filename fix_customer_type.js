const fs = require('fs');
const glob = require('fast-glob');

const files = glob.sync(['src/**/*.ts', 'src/**/*.tsx']);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes("customer_type === 'company'")) {
    content = content.replace(/\.customer_type === 'company'/g, ".customer_type?.toLowerCase() === 'company'");
    changed = true;
  }
  if (content.includes("customer_type === 'individual'")) {
    content = content.replace(/\.customer_type === 'individual'/g, ".customer_type?.toLowerCase() === 'individual'");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
