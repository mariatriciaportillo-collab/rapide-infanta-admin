const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

// 1. Add mechanicId state
const statePattern = /const \[serviceAdvisorId, setServiceAdvisorId\] = useState<string>\(initialData\?\.service_advisor_id \|\| ''\)\n/g;
if (!file.includes('mechanicId')) {
  file = file.replace(statePattern, 
    `const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')\n  const [mechanicId, setMechanicId] = useState<string>(initialData?.mechanic_id || '')\n  const [mechanics, setMechanics] = useState<any[]>([])\n`
  );
}

// 2. Fetch mechanics
const fetchPattern = /setAdvisors\(activeAdvisors\);\n    }/g;
if (!file.includes('setMechanics(')) {
  file = file.replace(fetchPattern, 
    `setAdvisors(activeAdvisors);
      
      let activeMechanics = [];
      if (data) {
        activeMechanics = data.filter(emp => 
          emp.roles && emp.roles.some((r: string) => {
            const role = r.toUpperCase();
            return role === 'MECHANIC / TECHNICIAN' || role === 'SENIOR MECHANIC' || role === 'MECHANIC';
          })
        );
      }
      
      if (initialData?.mechanic_id) {
        const isAlreadyInList = activeMechanics.some(m => m.id === initialData.mechanic_id);
        if (!isAlreadyInList) {
          const { data: historicalMechanic } = await supabase.from('employees')
            .select('id, full_name, roles, status')
            .eq('id', initialData.mechanic_id)
            .single();
            
          if (historicalMechanic) {
            activeMechanics.push(historicalMechanic);
          }
        }
      }
      setMechanics(activeMechanics);
    }`
  );
}

// 3. Payload update
const payloadPattern = /service_advisor_id: serviceAdvisorId \|\| null,/g;
if (!file.includes('mechanic_id:')) {
  file = file.replace(payloadPattern, 
    `service_advisor_id: serviceAdvisorId || null,
          mechanic_id: mechanicId || null,
          service_advisor_name: advisors.find(a => a.id === serviceAdvisorId)?.full_name || null,
          mechanic_name: mechanics.find(m => m.id === mechanicId)?.full_name || null,`
  );
}

// 4. UI Grid update
const uiPattern = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-slate-200">[\s\S]+?<\/div>\s*<\/div>/g;

const newUi = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 border-b border-slate-200">
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

if (!file.includes('Select a Mechanic')) {
  file = file.replace(uiPattern, newUi);
}

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
