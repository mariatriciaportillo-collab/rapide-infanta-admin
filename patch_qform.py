import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. State
state_pattern = r"const \[preparedBy, setPreparedBy\] = useState\('Rapide Infanta Admin'\)"
state_repl = r"const [preparedBy, setPreparedBy] = useState('Rapide Infanta Admin')\n  const [serviceAdvisorId, setServiceAdvisorId] = useState<string>(initialData?.service_advisor_id || '')\n  const [advisors, setAdvisors] = useState<any[]>([])"
content = re.sub(state_pattern, state_repl, content)

# 2. Fetch
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

# 3. Form input (in Service Details) - Wait, in the actual file, Service Details has:
# <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
# <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)}
advisor_pattern = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor<\/label>\n\s*<input type="text" value=\{preparedBy\} onChange=\{e => setPreparedBy\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-3" placeholder="Enter name\.\.\." \/>"""
advisor_repl = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <select value={serviceAdvisorId} onChange={e => {
              setServiceAdvisorId(e.target.value)
              const adv = advisors.find(a => a.id === e.target.value)
              if (adv) setPreparedBy(adv.full_name)
            }} className="w-full border border-slate-300 rounded-md p-3 bg-white">
              <option value="">Select an Advisor...</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.full_name}</option>
              ))}
            </select>"""
content = re.sub(advisor_pattern, advisor_repl, content)

# Also there's another preparedBy field in the footer
footer_pattern = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Prepared By<\/label>\n\s*<input type="text" value=\{preparedBy\} onChange=\{e => setPreparedBy\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-2" \/>"""
footer_repl = r"""<label className="block text-sm font-medium text-slate-700 mb-1">Prepared By</label>
              <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" disabled />"""
content = re.sub(footer_pattern, footer_repl, content)

# 4. Save payload
save_pattern = r"prepared_by: preparedBy,"
save_repl = r"prepared_by: preparedBy,\n          service_advisor_id: serviceAdvisorId || null,"
content = re.sub(save_pattern, save_repl, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
