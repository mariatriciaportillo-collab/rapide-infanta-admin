const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

// I also need to make sure the fetch logic and mechanicId states are properly added!
// Let's manually replace the section.

const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <select value={serviceAdvisorId} onChange={e => {
              setServiceAdvisorId(e.target.value)
              const adv = advisors.find(a => a.id === e.target.value)
              if (adv) setPreparedBy(adv.full_name) // keep fallback for older UI
            }} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select an Advisor...</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
            <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-md p-3" placeholder="10500" />
          </div>
        </div>`;

const newGrid = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <select value={serviceAdvisorId} onChange={e => setServiceAdvisorId(e.target.value)} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select an Advisor...</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mechanic</label>
            <select value={mechanicId} onChange={e => setMechanicId(e.target.value)} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select a Mechanic...</option>
              {mechanics.map(mech => (
                <option key={mech.id} value={mech.id}>{mech.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
            <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-md p-3" placeholder="10500" />
          </div>
        </div>`;

file = file.replace(oldGrid, newGrid);

// Ensure states are present:
if (!file.includes('mechanicId')) {
  file = file.replace(/const \[serviceAdvisorId, setServiceAdvisorId\] = useState<string>\(initialData\?\.service_advisor_id \|\| ''\)/, 
    `const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')\n  const [mechanicId, setMechanicId] = useState<string>(initialData?.mechanic_id || '')\n  const [mechanics, setMechanics] = useState<any[]>([])`
  );
}

// Add mechanic fetch to useEffect
if (!file.includes('activeMechanics')) {
  const fetchAdvisorsString = `    const fetchAdvisors = async () => {
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

  const fetchBothString = `    const fetchAdvisorsAndMechanics = async () => {
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .in('status', ['Active', 'ACTIVE']);
        
      let activeAdvisors = [];
      let activeMechanics = [];
      
      if (data) {
        activeAdvisors = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => r.toUpperCase() === 'SERVICE ADVISOR')
        );
        activeMechanics = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => {
            const role = r.toUpperCase();
            return role === 'MECHANIC / TECHNICIAN' || role === 'SENIOR MECHANIC' || role === 'MECHANIC';
          })
        );
      }
      
      // Historical checks
      if (initialData?.service_advisor_id) {
        if (!activeAdvisors.some(a => a.id === initialData.service_advisor_id)) {
          const { data: hist } = await supabase.from('employees').select('id, full_name, roles, status').eq('id', initialData.service_advisor_id).single();
          if (hist) activeAdvisors.push(hist);
        }
      }
      if (initialData?.mechanic_id) {
        if (!activeMechanics.some(a => a.id === initialData.mechanic_id)) {
          const { data: hist } = await supabase.from('employees').select('id, full_name, roles, status').eq('id', initialData.mechanic_id).single();
          if (hist) activeMechanics.push(hist);
        }
      }
      
      setAdvisors(activeAdvisors);
      setMechanics(activeMechanics);
    }`;

  file = file.replace(fetchAdvisorsString, fetchBothString);
  file = file.replace(/fetchAdvisors\(\)/g, "fetchAdvisorsAndMechanics()");
}

if (!file.includes('mechanic_id: mechanicId')) {
  file = file.replace(/service_advisor_id: serviceAdvisorId \|\| null,/g, 
    `service_advisor_id: serviceAdvisorId || null,\n          mechanic_id: mechanicId || null,\n          service_advisor_name: advisors.find(a => a.id === serviceAdvisorId)?.full_name || null,\n          mechanic_name: mechanics.find(m => m.id === mechanicId)?.full_name || null,`
  );
}

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
