const fs = require('fs');
let path = 'src/app/(dashboard)/parts/new/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \{ error: insertError \} = await supabase\n\s*\.from\('parts'\)\n\s*\.insert\(payload\)/,
  "const { data: newPart, error: insertError } = await supabase.from('parts').insert(payload).select('id').single()"
);

fs.writeFileSync(path, content);
