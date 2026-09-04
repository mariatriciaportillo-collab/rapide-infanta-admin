const fs = require('fs');

['src/components/quotations/QuotationForm.tsx', 'src/components/estimates/EstimateForm.tsx'].forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Import the hook
    if (!content.includes('usePartLaborAutomation')) {
      content = content.replace(
        /import \{ (.*?) \} from 'lucide-react'/,
        `import { $1 } from 'lucide-react'\nimport { usePartLaborAutomation } from '@/hooks/usePartLaborAutomation'`
      );

      // 2. Add is_auto_suggested to LineItem type
      content = content.replace(
        /is_section_header: boolean/,
        `is_section_header: boolean\n  is_auto_suggested?: boolean`
      );

      // 3. Inject hook inside component
      content = content.replace(
        /const \[items, setItems\] = useState<LineItem\[\]>\(\[\]\)/,
        `const [items, setItems] = useState<LineItem[]>([])\n  const { handleDismissLabor } = usePartLaborAutomation(items, setItems)`
      );

      // 4. Update handleRemoveItem to call handleDismissLabor
      content = content.replace(
        /const handleRemoveItem = \(id: string\) => \{\n\s*setItems\(items\.filter\(item => item\.id !== id\)\)\n\s*\}/,
        `const handleRemoveItem = (id: string) => {
    handleDismissLabor(id);
    setItems(items.filter(item => item.id !== id))
  }`
      );
      
      // 5. Update UI for the suggested badge
      const uiIndicator = `
                        <div className="flex flex-col">
                          {item.description}
                          {item.is_auto_suggested && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 self-start px-1.5 py-0.5 rounded mt-1">Suggested from Parts</span>
                          )}
                        </div>`;
      
      content = content.replace(
        /\{item\.description\}\n\s*\{item\.package_id &&/,
        `${uiIndicator}\n                          {item.package_id &&`
      );

      fs.writeFileSync(path, content);
    }
  }
});
