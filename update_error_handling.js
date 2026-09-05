const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Find catch block
  const catchRegex = /} catch \(err: any\) \{\n\s*console\.error\(err\)\n\s*setError\(err\.message \|\| 'An error occurred while saving\.'\)\n\s*setIsSubmitting\(false\)\n\s*\}/;

  const newCatch = `} catch (err: any) {
      console.log('Save Error:', err)
      const errorMsg = err?.message || err?.details || err?.hint || 'An error occurred while saving.'
      setError(errorMsg)
      setIsSubmitting(false)
    }`;

  content = content.replace(catchRegex, newCatch);
  
  // Let's also normalize the Supabase error handling before the catch block
  // Replace: if (insertError) throw insertError
  // With direct error setting
  const insertRegex = /if \(insertError\) throw insertError\n\n\s*router\.push\(`\/customers\/\$\{data\.id\}`\)/;
  
  const newInsert = `if (insertError) {
        setError(insertError.message || insertError.details || 'Unable to save customer: Database error.')
        setIsSubmitting(false)
        return
      }
      
      if (!data || !data.id) {
        setError('Save successful but no Customer ID was returned.')
        setIsSubmitting(false)
        return
      }

      router.push(\`/customers/\${data.id}\`)`;

  content = content.replace(insertRegex, newInsert);
  
  const updateRegex = /if \(updateError\) throw updateError\n\n\s*router\.push\(`\/customers\/\$\{id\}`\)/;
  const newUpdate = `if (updateError) {
        setError(updateError.message || updateError.details || 'Unable to update customer: Database error.')
        setIsSubmitting(false)
        return
      }

      router.push(\`/customers/\${id}\`)`;
      
  content = content.replace(updateRegex, newUpdate);

  fs.writeFileSync(file, content);
  console.log(`Updated error handling in ${file}`);
}

updateFile('src/app/(dashboard)/customers/new/page.tsx');
updateFile('src/app/(dashboard)/customers/[id]/edit/page.tsx');

