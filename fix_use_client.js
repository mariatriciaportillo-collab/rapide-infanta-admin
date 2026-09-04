const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git diff --name-only').toString().split('\n').filter(f => f.trim().endsWith('.tsx'));

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    const lines = content.split('\n');
    let useClientIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('use client')) {
        useClientIndex = i;
        break;
      }
    }
    
    if (useClientIndex > 0) {
      lines.splice(useClientIndex, 1);
      lines.unshift("'use client'");
      fs.writeFileSync(file, lines.join('\n'));
      console.log('Fixed use client in', file);
    }
  }
});
