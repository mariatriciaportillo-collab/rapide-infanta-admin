import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Add states for Packages
state_code = """  // Labor Services for Combobox
  const [laborServices, setLaborServices] = useState<any[]>([])
  
  // Packages for Combobox
  const [packages, setPackages] = useState<any[]>([])
  
  // Resolve Part Modal State
  const [isResolvePartModalOpen, setIsResolvePartModalOpen] = useState(false)
  const [resolvePartInfo, setResolvePartInfo] = useState<{parentItemId: string, childItemId: string, categoryId: string} | null>(null)
"""
content = content.replace("  // Labor Services for Combobox\n  const [laborServices, setLaborServices] = useState<any[]>([])", state_code)

# Add fetchPackages to useEffect
fetch_code = """    const fetchLabor = async () => {
      const { data } = await supabase
        .from('labor_services')
        .select('*, labor_groups(name), labor_categories(name)')
        .eq('is_active', true)
      if (data) setLaborServices(data)
    }
    
    const fetchPackages = async () => {
      const { data } = await supabase
        .from('packages')
        .select('*, package_items(*, labor_services(*), parts(*), part_categories(*))')
        .eq('is_active', true)
      if (data) setPackages(data)
    }

    fetchLabor()
    fetchPackages()"""
    
content = re.sub(r"    const fetchLabor = async \(\) => \{.*?fetchLabor\(\)", fetch_code, content, flags=re.DOTALL)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
