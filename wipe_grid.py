with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

start_marker = "      {(isAddingCustomer || isEditingCustomer || isAddingVehicle || isEditingVehicle) && (\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6\">"
end_marker = "      {/* SECTION 1: PACKAGES */}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx < end_idx:
        service_details_block = """      {/* Service Details */}
      <div className="mb-8 bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Service Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
            <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded-md p-3" placeholder="Enter name..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
            <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-md p-3" placeholder="10500" />
          </div>
        </div>
      </div>

"""
        content = content[:start_idx] + service_details_block + content[end_idx:]

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
