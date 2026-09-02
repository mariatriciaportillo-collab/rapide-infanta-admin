const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const hookInject = `  useEffect(() => {
    async function initUser() {
      if (!initialData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          const { data: emp } = await supabase.from('employees').select('full_name').eq('email', user.email).single()
          setPreparedBy(emp?.full_name || user.email)
        }
      }
    }
    initUser()
  }, [initialData, supabase])`;

file = file.replace(/  \/\/ Load initialData\n  useEffect\(\(\) => \{/, hookInject + '\n\n  // Load initialData\n  useEffect(() => {');

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
