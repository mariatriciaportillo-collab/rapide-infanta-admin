const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/*.{tsx,jsx}');

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  let original = c;
  
  c = c.replace(/className="hover:bg-slate-50">>/g, 'className="hover:bg-slate-50">');
  
  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log(`Fixed arrows in ${file}`);
  }
});
