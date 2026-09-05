const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix error handling in handleSave
  content = content.replace(/if \(insertError\) throw insertError\n\n      router\.push\(`\/customers\/\$\{data\.id\}`\)/g, 
    "if (insertError) {\n        setError(insertError.message || insertError.details || 'Unable to save customer.')\n        setIsSubmitting(false)\n        return\n      }\n\n      if (!data || !data.id) {\n        setError('Save successful but no ID returned.')\n        setIsSubmitting(false)\n        return\n      }\n\n      router.push(`/customers/${data.id}`)");

  content = content.replace(/if \(updateError\) throw updateError\n\n      router\.push\(`\/customers\/\$\{id\}`\)/g, 
    "if (updateError) {\n        setError(updateError.message || updateError.details || 'Unable to update customer.')\n        setIsSubmitting(false)\n        return\n      }\n\n      router.push(`/customers/${id}`)");

  // Fix payload in insert/update
  // Add company_name and contact_person
  if (file.includes('new/page.tsx')) {
    content = content.replace(/contact_last_name: customerType === 'company' \? cleanContactLast : null,/g, 
      "contact_last_name: customerType === 'company' ? cleanContactLast : null,\n          company_name: customerType === 'company' ? cleanCompanyName : null,\n          contact_person: customerType === 'company' ? `${cleanContactFirst} ${cleanContactLast}`.trim() : null,");
  } else {
    // in edit/page.tsx, cleanCompanyName is cleanName
    content = content.replace(/contact_last_name: customerType === 'company' \? cleanContactLast : null,/g, 
      "contact_last_name: customerType === 'company' ? cleanContactLast : null,\n          company_name: customerType === 'company' ? cleanName : null,\n          contact_person: customerType === 'company' ? `${cleanContactFirst} ${cleanContactLast}`.trim() : null,");
  }
  
  // Make sure customerType is lowercase
  content = content.replace(/customer_type: customerType\.toUpperCase\(\)/g, "customer_type: customerType");

  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
}

fixFile('src/app/(dashboard)/customers/new/page.tsx');
fixFile('src/app/(dashboard)/customers/[id]/edit/page.tsx');
