const { execSync } = require('child_process');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/*.tsx');
files.forEach(file => {
  if (file.includes('[id]') || file.includes('/new/') || file.includes('/edit/') || file.includes('/print/') || file.includes('/receipt/') || file.includes('/import/')) {
    try {
      execSync(`git checkout "${file}"`);
      console.log(`Reverted ${file}`);
    } catch (e) {}
  }
});
