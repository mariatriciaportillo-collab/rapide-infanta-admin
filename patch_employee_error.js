const fs = require('fs');

let form = fs.readFileSync('src/components/admin/EmployeeForm.tsx', 'utf8');

// Replace standard error setting with a cleaner message for schema cache errors
form = form.replace(/setError\(\`Failed to save: \$\{err\.message\}\`\)/g, `
      console.error("Database Error:", err);
      if (err.message?.includes('schema cache') || err.code === 'PGRST205' || err.code === 'PGRST204') {
        setError("System configuration error: The Employees database table is currently inaccessible. Please contact the administrator to apply the latest database migrations.");
      } else {
        setError(\`Failed to save: \${err.message}\`);
      }
`);

fs.writeFileSync('src/components/admin/EmployeeForm.tsx', form);
