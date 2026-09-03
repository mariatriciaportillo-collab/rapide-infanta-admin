const fs = require('fs');

function compactForm(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Reduce some general padding from mb-6 to mb-4, p-6 to p-4
  content = content.replace(/mb-6 p-6/g, 'mb-4 p-4');
  content = content.replace(/mb-6/g, 'mb-4');
  content = content.replace(/space-y-6/g, 'space-y-4');
  content = content.replace(/gap-6/g, 'gap-4');
  content = content.replace(/p-6/g, 'p-4');

  // We need to replace the Customer and Vehicle selection blocks with a single row on desktop.
  // The structure to replace starts with "{/* Enhanced Customer Search UI */}"
  // and ends before "{/* Service Details */}"
  const regex = /\{\/\* Enhanced Customer Search UI \*\/\}[\s\S]*?(?=\{\/\* Service Details \*\/\})/;
  
  const replacement = `
      {/* Compact Customer & Vehicle Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Customer Column */}
          <div className="relative">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Customer <span className="text-red-500">*</span></h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={customerSearch} 
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (selectedCustomerId) {
                       handleClearCustomer();
                       setCustomerSearch(e.target.value);
                    }
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (customerSearch.trim().length > 0) setShowDropdown(true);
                  }}
                  className={\`w-full pl-10 pr-4 py-2 border rounded-md transition focus:ring-2 focus:ring-blue-100 outline-none
                    \${selectedCustomerId ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'border-slate-300 focus:border-blue-400'}\`}
                  placeholder="Search customer name..." 
                />
                
                {/* Search Dropdown */}
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((cust) => {
                        const searchDisplayName = formatCustomerName(cust)
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => handleSelectCustomer(cust)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{searchDisplayName}</div>
                              {cust.customer_type === 'company' && cust.contact_person && (
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <User size={12} /> Contact: {formatContactPerson(cust.contact_person)}
                                </div>
                              )}
                            </div>
                            {(cust.telephone || cust.mobile) && (
                              <div className="text-xs text-slate-400">{cust.mobile || cust.telephone}</div>
                            )}
                          </button>
                        )
                      })
                    ) : customerSearch.length >= 2 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No customers found matching "{customerSearch}"</div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400">Type at least 2 characters to search</div>
                    )}
                  </div>
                )}
              </div>

              {selectedCustomerId && !isEditingCustomer && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingCustomer(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0"
                  title="Edit Customer"
                >
                  <Edit size={18} />
                </button>
              )}
              {selectedCustomerId && (
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearCustomer()
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0"
                  title="Clear Customer"
                >
                  <X size={18} />
                </button>
              )}
              {!selectedCustomerId && !isAddingCustomer && (
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearCustomer()
                    setIsAddingCustomer(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0 shadow-sm"
                  title="Add New Customer"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Column */}
          <div className="relative" ref={vehicleSearchRef}>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Vehicle <span className="text-red-500">*</span></h3>
            
            {!selectedCustomerId ? (
               <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 italic">
                 Select a customer first
               </div>
            ) : (
               <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Car size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={vehicleSearch} 
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        if (selectedVehicleId) {
                           handleClearVehicle();
                           setVehicleSearch(e.target.value);
                        }
                        setShowVehicleDropdown(true);
                      }}
                      onFocus={() => setShowVehicleDropdown(true)}
                      className={\`w-full pl-10 pr-4 py-2 border rounded-md transition focus:ring-2 focus:ring-blue-100 outline-none
                        \${selectedVehicleId ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'border-slate-300 focus:border-blue-400'}\`}
                      placeholder="Search customer's vehicles..." 
                    />
                    
                    {/* Vehicle Dropdown */}
                    {showVehicleDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
                        {customerVehicles.length > 0 ? (
                          customerVehicles.filter(v => 
                            !vehicleSearch || 
                            \`\${v.plate_number} \${v.make} \${v.model}\`.toLowerCase().includes(vehicleSearch.toLowerCase())
                          ).map((veh) => (
                            <button
                              key={veh.id}
                              type="button"
                              onClick={() => handleSelectVehicle(veh)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                            >
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">
                                  {veh.plate_number}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {veh.year || ''} {veh.make} {veh.model} {veh.engine_capacity ? \`(\${veh.engine_capacity})\` : ''}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">No vehicles on file for this customer</div>
                        )}
                      </div>
                    )}
                 </div>

                 {selectedVehicleId && !isEditingVehicle && (
                  <button 
                    type="button" 
                    onClick={() => setIsEditingVehicle(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0"
                    title="Edit Vehicle"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {selectedVehicleId && (
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearVehicle()
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0"
                    title="Clear Vehicle"
                  >
                    <X size={18} />
                  </button>
                )}
                {!selectedVehicleId && !isAddingVehicle && (
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearVehicle()
                      setIsAddingVehicle(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition flex items-center justify-center flex-shrink-0 shadow-sm"
                    title="Add New Vehicle"
                  >
                    <Plus size={18} />
                  </button>
                )}
               </div>
            )}
          </div>
        </div>
      </div>
      
`;

  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

compactForm('src/components/quotations/QuotationForm.tsx');
compactForm('src/components/estimates/EstimateForm.tsx');
