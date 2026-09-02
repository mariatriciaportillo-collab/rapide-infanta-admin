const fs = require('fs');

let file = fs.readFileSync('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx', 'utf8');

// Fix types
file = file.replace(/type PartMaterial = \{ id: string; name: string; item_code: string; brand: string \}/, 'type PartRecord = { id: string; name: string; part_number: string | null; brands?: { name: string } }');
file = file.replace(/parts_materials\?: PartMaterial/, 'parts?: PartRecord');

// Fix DB Query
file = file.replace(/parts_materials \(id, name, item_code, brand\)/, 'parts (id, name, part_number, brands (name))');

// Fix UI Rendering
file = file.replace(/item\.parts_materials \?/g, 'item.parts ?');
file = file.replace(/item\.parts_materials\.name/g, 'item.parts.name');
file = file.replace(/item\.parts_materials\.item_code/g, 'item.parts.part_number');
file = file.replace(/item\.parts_materials \? item\.parts_materials\.brand : '—'/g, 'item.parts && item.parts.brands ? item.parts.brands.name : "—"');

fs.writeFileSync('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx', file);
