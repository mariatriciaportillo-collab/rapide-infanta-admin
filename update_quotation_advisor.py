import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Add advisors state
if "const [advisors, setAdvisors]" not in content:
    state_pattern = r"const \[preparedBy, setPreparedBy\] = useState\(initialData\?\.prepared_by \|\| ''\)"
    state_repl = r"""const [preparedBy, setPreparedBy] = useState(initialData?.prepared_by || '')
  const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')
  const [advisors, setAdvisors] = useState<any[]>([])"""
    content = re.sub(state_pattern, state_repl, content)

# 2. Fetch advisors on mount
fetch_pattern = r"const fetchPackages = async \(\) => \{"
fetch_repl = r"""const fetchAdvisors = async () => {
      const { data } = await supabase.from('employees')
        .select('id, full_name, roles, status')
        .eq('status', 'Active')
        .contains('roles', ['Service Advisor'])
        
      if (data) setAdvisors(data)
    }
    
    fetchAdvisors()
    
    const fetchPackages = async () => {"""
content = re.sub(fetch_pattern, fetch_repl, content)

# Wait, Supabase `.contains` might need array literal syntax `{Service Advisor}` or array `['Service Advisor']`. 
# Using .contains('roles', ['Service Advisor']) is the correct syntax for PostgREST JSONB or array columns.

# 3. Modify the Service Advisor input to a select dropdown
advisor_input = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor<\/label>\n\s*<input type="text" value=\{preparedBy\} onChange=\{e => setPreparedBy\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-3" placeholder="Enter name..." \/>"""
advisor_select = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <select value={serviceAdvisorId} onChange={e => {
              setServiceAdvisorId(e.target.value)
              const adv = advisors.find(a => a.id === e.target.value)
              if (adv) setPreparedBy(adv.full_name) // keep fallback for older UI
            }} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select an Advisor...</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.full_name}</option>
              ))}
            </select>"""
content = re.sub(advisor_input, advisor_select, content)

# 4. Add service_advisor_id to save payload
save_pattern = r"prepared_by: preparedBy\.trim\(\),"
save_repl = r"prepared_by: preparedBy.trim(),\n      service_advisor_id: serviceAdvisorId || null,"
content = re.sub(save_pattern, save_repl, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
