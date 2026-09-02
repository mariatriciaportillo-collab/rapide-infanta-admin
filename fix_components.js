const fs = require('fs');

// Fix PartsLookupClient.tsx
let clientFile = fs.readFileSync('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx', 'utf8');
clientFile = clientFile.replace(/m => \(\{ value: m\.id, label: m\.name \}\)/g, 'm => ({ id: m.id, name: m.name })');
clientFile = clientFile.replace(/disabled=\{!vehMakeId\}/g, '');
clientFile = clientFile.replace(/totalItems=\{totalCount\}/g, 'totalCount={totalCount}');
fs.writeFileSync('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx', clientFile);

// Fix PartsLookupForm.tsx
let formFile = fs.readFileSync('src/components/parts/PartsLookupForm.tsx', 'utf8');
formFile = formFile.replace(/m => \(\{ value: m\.id, label: m\.name \}\)/g, 'm => ({ id: m.id, name: m.name })');
formFile = formFile.replace(/p => \(\{ value: p\.id, label: `\$\{p\.item_code\} - \$\{p\.name\} \(\$\{p\.brand \|\| 'No Brand'\}\)` \}\)/g, 'p => ({ id: p.id, name: `${p.item_code} - ${p.name} (${p.brand || "No Brand"})` })');
formFile = formFile.replace(/\{ value: '', label: '— Custom \/ External Part —' \}/g, '{ id: "", name: "— Custom / External Part —" }');
formFile = formFile.replace(/disabled=\{!makeId\}/g, '');
fs.writeFileSync('src/components/parts/PartsLookupForm.tsx', formFile);
