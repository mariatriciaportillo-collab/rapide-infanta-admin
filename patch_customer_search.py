import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Fix useEffect search to load default customers when empty.
old_search_effect = r"""  \/\/ Search Customers
  useEffect\(\(\) => \{
    const search = async \(\) => \{
      if \(customerSearch\.trim\(\)\.length < 2\) \{
        setSearchResults\(\[\]\)
        return
      \}
      
      const customerPromise = supabase
        \.from\('customers'\)
        \.select\('\*'\)
        \.or\(`name\.ilike\.%\$\{customerSearch\}%,first_name\.ilike\.%\$\{customerSearch\}%,last_name\.ilike\.%\$\{customerSearch\}%,contact_person\.ilike\.%\$\{customerSearch\}%,contact_first_name\.ilike\.%\$\{customerSearch\}%,contact_last_name\.ilike\.%\$\{customerSearch\}%,mobile\.ilike\.%\$\{customerSearch\}%`\)
        \.limit\(5\)

      const vehiclePromise = supabase
        \.from\('vehicles'\)
        \.select\('\*, customers\(\*\)'\)
        \.ilike\('plate_number', `%\$\{customerSearch\}%`\)
        \.limit\(5\)

      const \[custRes, vehRes\] = await Promise\.all\(\[customerPromise, vehiclePromise\]\)"""

new_search_effect = """  // Search Customers
  useEffect(() => {
    const search = async () => {
      let customerPromise;
      let vehiclePromise;

      if (customerSearch.trim().length === 0) {
        // Fetch top 50 recent/all customers when empty
        customerPromise = supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        vehiclePromise = Promise.resolve({ data: [] }); // Don't fetch random vehicles
      } else {
        customerPromise = supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.%${customerSearch}%,first_name.ilike.%${customerSearch}%,last_name.ilike.%${customerSearch}%,contact_person.ilike.%${customerSearch}%,contact_first_name.ilike.%${customerSearch}%,contact_last_name.ilike.%${customerSearch}%,mobile.ilike.%${customerSearch}%`)
          .limit(20)

        vehiclePromise = supabase
          .from('vehicles')
          .select('*, customers(*)')
          .ilike('plate_number', `%${customerSearch}%`)
          .limit(10)
      }

      const [custRes, vehRes] = await Promise.all([customerPromise, vehiclePromise])"""

content = re.sub(old_search_effect, new_search_effect, content)


# 2. Modify limit on combined map to show more results (e.g., up to 50)
content = re.sub(r"setSearchResults\(Array\.from\(combined\.values\(\)\)\.slice\(0, 6\)\)", r"setSearchResults(Array.from(combined.values()).slice(0, 50))", content)


# 3. Modify the UI for customer search block
old_search_ui = r"""      \{\!selectedCustomerId && \(
        <div className="mb-6 relative" ref=\{searchRef\}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size=\{20\} \/>
            <input
              type="text"
              placeholder="Search existing customer or company\.\.\."
              value=\{customerSearch\}
              onChange=\{\(e\) => \{
                setCustomerSearch\(e\.target\.value\)
                setShowDropdown\(true\)
              \}\}
              onFocus=\{\(\) => setShowDropdown\(true\)\}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            \/>
          <\/div>
          
          \{showDropdown && searchResults\.length > 0 && \(
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              \{searchResults\.map\(\(cust\) => \{
                const searchDisplayName = formatCustomerName\(cust\)
                return \(
                  <button
                    key=\{cust\.id\}
                    type="button"
                    onClick=\{\(\) => handleSelectCustomer\(cust\)\}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">\{searchDisplayName\}<\/div>
                      <div className="text-sm text-slate-500 capitalize">\{cust\.customer_type\} • \{cust\.mobile \|\| cust\.telephone \|\| 'No contact number'\}<\/div>
                      \{cust\.matched_vehicle && \(
                        <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                          <Car size=\{14\} \/> \{cust\.matched_vehicle\.make\} \{cust\.matched_vehicle\.model\} • \{cust\.matched_vehicle\.plate_number\}
                        <\/div>
                      \)\}
                    <\/div>
                    \{cust\.customer_type === 'company' \? <Building2 size=\{18\} className="text-slate-400" \/> : <User size=\{18\} className="text-slate-400" \/>\}
                  <\/button>
                \)
              \}\)\}
            <\/div>
          \)\}
        <\/div>
      \)\}"""

new_search_ui = """      {/* Enhanced Customer Search UI */}
      {!selectedCustomerId && (
        <div className="mb-8" ref={searchRef}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Customer</h3>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search or select customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowDropdown(true)
                  }}
                  onClick={() => setShowDropdown(true)}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              
              {showDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[350px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((cust) => {
                      const searchDisplayName = formatCustomerName(cust)
                      return (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{searchDisplayName}</div>
                            <div className="text-sm text-slate-500 capitalize">{cust.customer_type} • {cust.mobile || cust.telephone || 'No contact number'}</div>
                            {cust.matched_vehicle && (
                              <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                <Car size={14} /> {cust.matched_vehicle.make} {cust.matched_vehicle.model} • {cust.matched_vehicle.plate_number}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded capitalize">{cust.customer_type}</span>
                            {cust.customer_type === 'company' ? <Building2 size={16} className="text-slate-400" /> : <User size={16} className="text-slate-400" />}
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-500">No customers found</div>
                  )}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => {
                // Clear selected to enter creation mode
                handleClearCustomer()
                // Force state to creating mode
                setSelectedCustomerId(null)
              }}
              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add New Customer
            </button>
          </div>
        </div>
      )}"""

content = re.sub(old_search_ui, new_search_ui, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)

