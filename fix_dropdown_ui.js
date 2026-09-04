const fs = require('fs');

const files = [
  'src/app/(dashboard)/part-labor-rules/new/page.tsx',
  'src/app/(dashboard)/part-labor-rules/[id]/edit/page.tsx'
];

files.forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Add imports
    if (!content.includes('SearchableCombobox')) {
      content = content.replace(
        /import \{ (.*?) \} from 'lucide-react'/,
        `import { $1 } from 'lucide-react'\nimport { SearchableCombobox } from '@/components/ui/SearchableCombobox'`
      );
    }

    // Replace the select with SearchableCombobox for Suggested Labor
    const selectRegex = /<select[\s\S]*?value=\{laborId\}[\s\S]*?onChange=\{e => setLaborId\(e\.target\.value\)\}[\s\S]*?>[\s\S]*?<option value="" disabled>-- Select Labor to Suggest --<\/option>[\s\S]*?\{availableLabor\.map\(l => \([\s\S]*?<option key=\{l\.id\} value=\{l\.id\}>\{l\.name\}<\/option>[\s\S]*?\)\)\}[\s\S]*?<\/select>/;
    
    const searchableComboboxStr = `<SearchableCombobox 
              options={availableLabor.map(l => ({ id: l.id, label: l.name }))}
              value={laborId}
              onChange={setLaborId}
              placeholder="Search existing labor services..."
            />`;

    if (selectRegex.test(content)) {
      content = content.replace(selectRegex, searchableComboboxStr);
      fs.writeFileSync(path, content);
      console.log("Updated UI for", path);
    } else {
      console.log("Regex didn't match for", path);
    }
  }
});
