const fs = require('fs');

['src/app/(dashboard)/part-labor-rules/new/page.tsx', 'src/app/(dashboard)/part-labor-rules/[id]/edit/page.tsx'].forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    const duplicateCheckStr = `
    setIsSubmitting(true)
    try {
      // Duplicate Rule Check
      const selectedPartIds = [...selectedParts.map(p => p.id)].sort();
      
      const { data: existingRules, error: fetchErr } = await supabase
        .from('part_labor_rules')
        .select('id, triggers:part_labor_rule_triggers(part_id)')
        .eq('labor_id', laborId)
        .eq('rule_type', ruleType);
        
      if (!fetchErr && existingRules) {
        for (const er of existingRules) {
          // Skip if we are editing the exact same rule
          if (er.id === (typeof ruleId !== 'undefined' ? ruleId : undefined)) continue;
          
          const erPartIds = (er.triggers || []).map((t: any) => t.part_id).sort();
          if (erPartIds.length === selectedPartIds.length && erPartIds.every((val: string, index: number) => val === selectedPartIds[index])) {
            throw new Error('An identical active rule already exists for these trigger parts and labor service.');
          }
        }
      }
`;

    // Replace the start of the submit try block
    content = content.replace(
      /setIsSubmitting\(true\)\n\s*try \{/,
      duplicateCheckStr
    );

    fs.writeFileSync(path, content);
    console.log("Updated duplicate check for", path);
  }
});
