const fs = require('fs');
let form = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

const newFetch = `    const fetchAdvisors = async () => {
      // 1. Fetch active service advisors
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .in('status', ['Active', 'ACTIVE']);
        
      let activeAdvisors = [];
      if (data) {
        activeAdvisors = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => r.toUpperCase() === 'SERVICE ADVISOR')
        );
      }
      
      // 2. If editing and there is a selected advisor, ensure they are in the list even if inactive
      if (initialData?.service_advisor_id) {
        const isAlreadyInList = activeAdvisors.some(a => a.id === initialData.service_advisor_id);
        if (!isAlreadyInList) {
          const { data: historicalAdvisor } = await supabase.from('employees')
            .select('id, full_name, roles, status')
            .eq('id', initialData.service_advisor_id)
            .single();
            
          if (historicalAdvisor) {
            activeAdvisors.push(historicalAdvisor);
          }
        }
      }
      
      setAdvisors(activeAdvisors);
    }`;

const oldFetch = `    const fetchAdvisors = async () => {
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

form = form.replace(oldFetch, newFetch);
fs.writeFileSync('src/components/quotations/QuotationForm.tsx', form);
