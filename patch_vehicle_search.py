import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

pattern = r"(            <Plus size=\{18\} \/> Add New Customer\n          <\/button>\n        <\/div>\n      <\/div>)"

vehicle_search_block = """      {/* Enhanced Vehicle Search UI */}
      {selectedCustomerId && (
        <div className="mb-6" ref={vehicleSearchRef}>
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

content = re.sub(pattern, r"\1\n\n" + vehicle_search_block, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
