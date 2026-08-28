const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

// 1. Replace the old delete logic in the edit block.
const oldDeleteRegex = /\/\/ Delete old items so we can insert cleanly\s*await supabase\.from\('quotation_items'\)\.delete\(\)\.eq\('quotation_id', quote\.id\)/;
file = file.replace(oldDeleteRegex, `// We will delete removed items AFTER upserting the new/updated ones.`);

// 2. Add the idMap logic right before itemsToInsert
const itemsToInsertRegex = /(\/\/ 3\. Insert Line Items\s*const itemsToInsert = items)/;
const idMapLogic = `// 3. Prepare Line Items
      // Generate fresh IDs for this specific save attempt to prevent 23505 on retries
      const existingDbIds = new Set((initialData?.quotation_items || []).map((i: any) => i.id));
      const idMap = new Map<string, string>();
      
      items.forEach(item => {
        if (existingDbIds.has(item.id)) {
          idMap.set(item.id, item.id);
        } else {
          idMap.set(item.id, crypto.randomUUID());
        }
      });

      const itemsToInsert = items`;
file = file.replace(itemsToInsertRegex, idMapLogic);

// 3. Update the mapping in itemsToInsert to use idMap
file = file.replace(/id: item\.id,/, 'id: idMap.get(item.id),');
file = file.replace(/parent_item_id: item\.parent_item_id \|\| null,/, 'parent_item_id: item.parent_item_id ? idMap.get(item.parent_item_id) : null,');

// 4. Change insert to upsert and add delete logic
const insertRegex = /const { error: itemsError } = await supabase\s*\.from\('quotation_items'\)\s*\.insert\(itemsToInsert\)/;
const upsertLogic = `const { error: itemsError } = await supabase
          .from('quotation_items')
          .upsert(itemsToInsert) // Use upsert instead of insert
          
      // Delete removed items if editing
      if (isEditingQuote && initialData?.quotation_items) {
        const currentItemIds = new Set(itemsToInsert.map(i => i.id));
        const itemsToDelete = initialData.quotation_items
          .filter((i: any) => !currentItemIds.has(i.id))
          .map((i: any) => i.id);
          
        if (itemsToDelete.length > 0) {
          const { error: delErr } = await supabase.from('quotation_items').delete().in('id', itemsToDelete);
          if (delErr) console.error("Failed to delete removed items", delErr);
        }
      }`;
file = file.replace(insertRegex, upsertLogic);

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
