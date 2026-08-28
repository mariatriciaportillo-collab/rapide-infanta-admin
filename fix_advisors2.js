const fs = require('fs');

let form = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const oldFetch = `    const fetchAdvisors = async () => {
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .eq('status', 'Active')
        .contains('roles', ['SERVICE ADVISOR'])
        
      if (data) setAdvisors(data)
    }`;

const newFetch = `    const fetchAdvisors = async () => {
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .in('status', ['Active', 'ACTIVE'])
        
      if (data) {
        // Filter locally to safely handle any case variations
        const filtered = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => r.toUpperCase() === 'SERVICE ADVISOR')
        );
        setAdvisors(filtered);
      }
    }`;

if(form.includes(oldFetch)) {
  form = form.replace(oldFetch, newFetch);
} else {
  // Try original
  const oldFetchOrig = `    const fetchAdvisors = async () => {
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .eq('status', 'Active')
        .contains('roles', ['Service Advisor'])
        
      if (data) setAdvisors(data)
    }`;
    form = form.replace(oldFetchOrig, newFetch);
}

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', form);
