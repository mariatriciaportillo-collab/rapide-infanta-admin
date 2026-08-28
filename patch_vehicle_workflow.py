import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Insert Vehicle Search block right below the Customer Search block
customer_block_end_pattern = r"(              <Plus size=\{18\} \/> Add New Customer\n            <\/button>\n          <\/div>\n        <\/div>\n      \)\})"

vehicle_search_block = """      {/* Enhanced Vehicle Search UI */}
      {selectedCustomerId && (
        <div className="mb-8" ref={vehicleSearchRef}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Vehicle</h3>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1 relative">
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search or select vehicle..."
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value)
                    if (selectedVehicleId) {
                      setSelectedVehicleId(null)
                    }
                    setShowVehicleDropdown(true)
                  }}
                  onClick={() => {
                    if (vehicleSearch === '') setShowVehicleDropdown(true)
                    else setShowVehicleDropdown(!showVehicleDropdown)
                  }}
                  onFocus={() => setShowVehicleDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              
              {showVehicleDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[350px] overflow-y-auto">
                  {(() => {
                     const searchLower = vehicleSearch.toLowerCase();
                     const filteredVehicles = customerVehicles.filter(v => {
                       if (!searchLower) return true;
                       const str = `${v.plate_number || ''} ${v.make || ''} ${v.model || ''} ${v.year || ''}`.toLowerCase();
                       return str.includes(searchLower);
                     });
                     
                     if (filteredVehicles.length === 0) {
                       return <div className="p-4 text-center text-slate-500">No vehicles found for this customer.</div>
                     }
                     
                     return filteredVehicles.map(v => (
                       <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVehicle(v)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                       >
                         <div>
                           <div className="font-semibold text-slate-900">{formatVehicleName(v)}</div>
                         </div>
                         <Car size={16} className="text-slate-400" />
                       </button>
                     ))
                  })()}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => {
                setSelectedVehicleId(null)
                setVehiclePlate('')
                setVehicleMake('')
                setVehicleModel('')
                setVehicleYear('')
                setVehicleTransmission('')
                setMileage('')
                setVehicleSearch('')
                setIsAddingVehicle(true)
                setShowVehicleDropdown(false)
              }}
              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add New Vehicle
            </button>
          </div>
        </div>
      )}"""

# Replace the closing tag of the Customer block and append the new Vehicle block
if "Enhanced Vehicle Search UI" not in content:
    content = re.sub(customer_block_end_pattern, r"\1\n\n" + vehicle_search_block, content)


# 2. Clean up Vehicle Details section
# We remove the "Select from Fleet" list and the confusing "Add Vehicle" top buttons since they are now properly covered by the main search block.
old_vehicle_details_pattern = r"        \{\/\* Vehicle Details \*\/\}[\s\S]*?        \{\/\* SECTION 1: PACKAGES \*\/\}"

new_vehicle_details = """        {/* Vehicle Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Car size={18} className="text-slate-500"/>
              Vehicle Information
              {selectedVehicleId && !isEditingVehicle && (
                <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Existing Vehicle
                </span>
              )}
            </h3>
            {selectedCustomerId && selectedVehicleId && !isEditingVehicle && (
              <button type="button" onClick={() => setIsEditingVehicle(true)} className="text-sm font-medium text-blue-600 hover:underline">
                Edit Vehicle
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
              {selectedVehicleId && !isEditingVehicle ? (
                <div className="w-full border border-slate-200 rounded-md p-2 font-bold bg-slate-50 text-slate-900 uppercase">{vehiclePlate}</div>
              ) : (
                <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              {selectedVehicleId && !isEditingVehicle ? (
                <div className="w-full border border-slate-200 rounded-md p-2 bg-slate-50 text-slate-900">{vehicleMake || '-'}</div>
              ) : (
                <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              {selectedVehicleId && !isEditingVehicle ? (
                <div className="w-full border border-slate-200 rounded-md p-2 bg-slate-50 text-slate-900">{vehicleModel || '-'}</div>
              ) : (
                <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Vios" />
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              {selectedVehicleId && !isEditingVehicle ? (
                <div className="w-full border border-slate-200 rounded-md p-2 bg-slate-50 text-slate-900">{vehicleYear || '-'}</div>
              ) : (
                <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" />
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
              {selectedVehicleId && !isEditingVehicle ? (
                <div className="w-full border border-slate-200 rounded-md p-2 bg-slate-50 text-slate-900">{vehicleTransmission || '-'}</div>
              ) : (
                <select value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
                  <option value="">Select...</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
              <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-md p-2" placeholder="10500" />
              <p className="text-xs text-slate-500 mt-1">Mileage is always editable for current service</p>
            </div>
            
            {(isAddingVehicle || isEditingVehicle) && !selectedVehicleId && selectedCustomerId && (
              <div className="col-span-2 mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => {
                  if (isAddingVehicle) {
                    setIsAddingVehicle(false)
                    if (customerVehicles.length > 0) handleSelectVehicle(customerVehicles[0])
                  } else {
                    setIsEditingVehicle(false)
                    const orig = customerVehicles.find(v => v.id === selectedVehicleId)
                    if (orig) handleSelectVehicle(orig)
                  }
                }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveVehicleChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                  {isAddingVehicle ? 'Save New Vehicle' : 'Save Vehicle Changes'}
                </button>
              </div>
            )}
            
            {isEditingVehicle && selectedVehicleId && selectedCustomerId && (
              <div className="col-span-2 mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => {
                  setIsEditingVehicle(false)
                  const orig = customerVehicles.find(v => v.id === selectedVehicleId)
                  if (orig) handleSelectVehicle(orig)
                }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveVehicleChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                  Save Vehicle Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: PACKAGES */}"""

content = re.sub(old_vehicle_details_pattern, new_vehicle_details, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
