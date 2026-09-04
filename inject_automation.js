const fs = require('fs');

['src/components/quotations/QuotationForm.tsx', 'src/components/estimates/EstimateForm.tsx'].forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Add state variables for rules
    if (!content.includes('partLaborRules')) {
      content = content.replace(
        /const \[packages, setPackages\] = useState<any\[\]>\(\[\]\)/,
        `const [packages, setPackages] = useState<any[]>([])\n  const [partLaborRules, setPartLaborRules] = useState<any[]>([])\n  const [dismissedLaborIds, setDismissedLaborIds] = useState<string[]>([])`
      );

      // 2. Fetch rules on mount
      content = content.replace(
        /const fetchPackages = async \(\) => \{[\s\S]*?fetchPackages\(\)/,
        `const fetchPackages = async () => {
      const { data } = await supabase
        .from('packages')
        .select('*, package_items(*, labor_services(*), parts(*), part_categories(*))')
        .eq('is_active', true)
      if (data) setPackages(data)
    }

    const fetchRules = async () => {
      const { data } = await supabase
        .from('part_labor_rules')
        .select(\`*, labor:labor_id(*), triggers:part_labor_rule_triggers(part_id)\`)
        .eq('active', true)
      if (data) setPartLaborRules(data)
    }

    fetchLabor()
    fetchPackages()
    fetchRules()`
      );

      // 3. Add useEffect to watch `items` and apply rules
      const automationLogic = `
  // Part-to-Labor Automation
  useEffect(() => {
    if (partLaborRules.length === 0) return;
    if (items.length === 0) return;

    // We only process standalone parts (no package_id)
    const standaloneParts = items.filter(i => i.item_type === 'part' && !i.package_id && i.part_id);
    const presentPartIds = new Set(standaloneParts.map(i => i.part_id));

    // Evaluate combination rules first
    const comboRules = partLaborRules.filter(r => r.rule_type === 'COMBINATION');
    const singleRules = partLaborRules.filter(r => r.rule_type === 'SINGLE');

    const matchedLaborIds = new Set<string>();
    const consumedPartIds = new Set<string>();

    for (const rule of comboRules) {
      if (!rule.triggers || rule.triggers.length === 0) continue;
      // check if all trigger parts are present
      const allPresent = rule.triggers.every((t: any) => presentPartIds.has(t.part_id));
      if (allPresent) {
        matchedLaborIds.add(rule.labor_id);
        rule.triggers.forEach((t: any) => consumedPartIds.add(t.part_id));
      }
    }

    for (const rule of singleRules) {
      if (!rule.triggers || rule.triggers.length === 0) continue;
      const partId = rule.triggers[0].part_id;
      // Only suggest if present AND not consumed by a combo rule
      if (presentPartIds.has(partId) && !consumedPartIds.has(partId)) {
        matchedLaborIds.add(rule.labor_id);
      }
    }

    const existingLaborIds = new Set(items.filter(i => i.item_type === 'labor' && i.labor_service_id).map(i => i.labor_service_id));
    
    let newItems = [...items];
    let changed = false;

    // 1. Remove auto-suggested labors that are no longer matched
    for (let i = newItems.length - 1; i >= 0; i--) {
      const item = newItems[i];
      if (item.item_type === 'labor' && item.is_auto_suggested) {
        if (!matchedLaborIds.has(item.labor_service_id)) {
          newItems.splice(i, 1);
          changed = true;
        }
      }
    }

    // 2. Add newly matched labors that aren't already existing or dismissed
    for (const lid of Array.from(matchedLaborIds)) {
      if (!existingLaborIds.has(lid) && !dismissedLaborIds.includes(lid)) {
        const rule = partLaborRules.find(r => r.labor_id === lid);
        if (rule && rule.labor) {
          newItems.push({
            id: crypto.randomUUID(),
            item_type: 'labor',
            labor_service_id: rule.labor.id,
            description: rule.labor.name,
            quantity: 1,
            unit_price: 0, // Staff must manually enter
            total_price: 0,
            is_section_header: false,
            is_auto_suggested: true // Mark for UI indicator and tracking
          });
          changed = true;
        }
      }
    }

    if (changed) {
      setItems(newItems);
    }
  }, [items, partLaborRules, dismissedLaborIds]);`;

      content = content.replace(
        /const handleAddItem = /,
        `${automationLogic}\n\n  const handleAddItem = `
      );

      // 4. Update the LineItem interface to include `is_auto_suggested`
      content = content.replace(
        /is_section_header: boolean/,
        `is_section_header: boolean\n  is_auto_suggested?: boolean`
      );

      // 5. Update UI to show the 'Suggested from Parts' indicator
      const uiIndicator = `
                          <div className="flex flex-col">
                            {item.description}
                            {item.is_auto_suggested && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 self-start px-1.5 py-0.5 rounded mt-1">Suggested from Parts</span>
                            )}
                          </div>`;
      
      content = content.replace(
        /\{item\.description\}\n\s*\{item\.package_id &&/,
        `${uiIndicator}\n                            {item.package_id &&`
      );
      // Alternative matching for EstimateForm if slightly different
      content = content.replace(
        /<td className="px-3 py-2">\{item\.description\}<\/td>/,
        `<td className="px-3 py-2">
                          <div className="flex flex-col">
                            {item.description}
                            {item.is_auto_suggested && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 self-start px-1.5 py-0.5 rounded mt-1">Suggested from Parts</span>
                            )}
                          </div>
                        </td>`
      );

      // 6. Track deletion in `dismissedLaborIds`
      const oldRemoveItem = `const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }`;
      const newRemoveItem = `const handleRemoveItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.item_type === 'labor' && item.is_auto_suggested && item.labor_service_id) {
      setDismissedLaborIds([...dismissedLaborIds, item.labor_service_id]);
    }
    setItems(items.filter(item => item.id !== id))
  }`;
      content = content.replace(oldRemoveItem, newRemoveItem);

      fs.writeFileSync(path, content);
    }
  }
});
