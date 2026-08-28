import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Update handleSelectCustomer to keep the name in the search box, and close dropdown
old_select = r"setCustomerSearch\(''\)\n\s+setShowDropdown\(false\)"
new_select = r"setCustomerSearch(formatCustomerName(customer))\n    setShowDropdown(false)"
content = re.sub(old_select, new_select, content)
# Just in case the previous script didn't have setShowDropdown(false) in handleSelectCustomer:
content = content.replace("setCustomerSearch('')", "setCustomerSearch(formatCustomerName(customer))\n    setShowDropdown(false)")

# 2. Make the Customer search block ALWAYS visible, and fix the onChange
old_ui = r"      \{\/\* Enhanced Customer Search UI \*\/\}\n      \{\!selectedCustomerId && \(\n        <div className=\"mb-8\" ref=\{searchRef\}>[\s\S]*?            <\/button>\n          <\/div>\n        <\/div>\n      \)\}"

new_ui = """      {/* Enhanced Customer Search UI */}
      <div className="mb-6" ref={searchRef}>
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
                  if (selectedCustomerId) {
                     // If they start typing again, clear the selected customer to allow searching a different one
                     handleClearCustomer()
                     setCustomerSearch(e.target.value) // re-apply since clear clears it
                  }
                  setShowDropdown(true)
                }}
                onClick={() => {
                  if (customerSearch === '') {
                     setShowDropdown(true)
                  } else {
                     setShowDropdown(!showDropdown)
                  }
                }}
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
              handleClearCustomer()
              setShowDropdown(false)
            }}
            className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add New Customer
          </button>
        </div>
      </div>"""

content = re.sub(old_ui, new_ui, content)

# 3. Remove "Change Customer" button from the details section since we now use the main search bar for that.
old_change_btn = r"<button type=\"button\" onClick=\{handleClearCustomer\} className=\"text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline\">\n\s+Change Customer\n\s+<\/button>"
content = re.sub(old_change_btn, "", content)

# 4. Make sure empty search triggers loading ALL customers properly
old_search_effect = r"if \(customerSearch\.trim\(\)\.length === 0\) \{[\s\S]*?vehiclePromise = Promise\.resolve\(\{ data: \[\] \}\); \/\/ Don't fetch random vehicles\n\s+\} else \{"
new_search_effect = """if (customerSearch.trim().length === 0) {
        customerPromise = supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        vehiclePromise = Promise.resolve({ data: [] }); 
      } else {"""
# Just rewrite the search effect completely to be safe, because sometimes spacing causes regex to fail.
search_effect_pattern = r"  \/\/ Search Customers\n  useEffect\(\(\) => \{[\s\S]*?const \[custRes, vehRes\] = await Promise\.all\(\[customerPromise, vehiclePromise\]\)"

complete_new_search_effect = """  // Search Customers
  useEffect(() => {
    const search = async () => {
      let customerPromise;
      let vehiclePromise;

      if (customerSearch.trim().length === 0) {
        customerPromise = supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        vehiclePromise = Promise.resolve({ data: [] });
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

content = re.sub(search_effect_pattern, complete_new_search_effect, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)

