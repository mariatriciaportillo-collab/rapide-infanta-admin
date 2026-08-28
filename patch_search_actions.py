import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Customer Search Actions
# We want to change the `flex gap-4 items-start` block for Customer
customer_actions_pattern = r"""(<div className="flex gap-4 items-start">\s+<div className="flex-1 relative">[\s\S]*?<\/div>\s+)(<button\s+type="button"\s+onClick=\{\(\) => \{\s+handleClearCustomer\(\)\s+setShowDropdown\(false\)\s+\}\}\s+className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"\s+>\s+<Plus size=\{18\} \/> Add New Customer\s+<\/button>)"""

customer_actions_replacement = r"""\1{selectedCustomerId && !isEditingCustomer && (
            <button
              type="button"
              onClick={() => setIsEditingCustomer(true)}
              className="p-3 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex-shrink-0"
              title="Edit Customer"
            >
              <Edit size={20} />
            </button>
          )}
          {selectedCustomerId && (
            <button
              type="button"
              onClick={() => {
                handleClearCustomer()
                setShowDropdown(false)
              }}
              className="p-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex-shrink-0"
              title="Clear Customer"
            >
              <X size={20} />
            </button>
          )}
          \2"""

# Add Edit and X icons to lucide-react import
if "Edit" not in content or "X" not in content:
    content = content.replace("import { Plus, Trash2, ArrowLeft, Save, Search, User, Car, Building2 } from 'lucide-react'", "import { Plus, Trash2, ArrowLeft, Save, Search, User, Car, Building2, Edit, X } from 'lucide-react'")

content = re.sub(customer_actions_pattern, customer_actions_replacement, content)


# 2. Vehicle Search Actions
vehicle_actions_pattern = r"""(<div className="flex gap-4 items-start">\s+<div className="flex-1 relative">\s+<div className="relative">\s+<Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size=\{20\} \/>[\s\S]*?<\/div>\s+)(<button\s+type="button"\s+onClick=\{\(\) => \{\s+setSelectedVehicleId\(null\)\s+setVehiclePlate\(''\)\s+setVehicleMake\(''\)\s+setVehicleModel\(''\)\s+setVehicleYear\(''\)\s+setVehicleTransmission\(''\)\s+setMileage\(''\)\s+setVehicleSearch\(''\)\s+setIsAddingVehicle\(true\)\s+setShowVehicleDropdown\(false\)\s+\}\}\s+className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2"\s+>\s+<Plus size=\{18\} \/> Add New Vehicle\s+<\/button>)"""

vehicle_actions_replacement = r"""\1{selectedVehicleId && !isEditingVehicle && (
            <button
              type="button"
              onClick={() => setIsEditingVehicle(true)}
              className="p-3 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex-shrink-0"
              title="Edit Vehicle"
            >
              <Edit size={20} />
            </button>
          )}
          {selectedVehicleId && (
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
                setIsAddingVehicle(false)
                setIsEditingVehicle(false)
                setShowVehicleDropdown(false)
              }}
              className="p-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex-shrink-0"
              title="Clear Vehicle"
            >
              <X size={20} />
            </button>
          )}
          \2"""

content = re.sub(vehicle_actions_pattern, vehicle_actions_replacement, content)


# 3. Handle Mileage
# I will insert the small mileage editor below the vehicle search bar
mileage_block = """
          </div>
          {selectedVehicleId && !isEditingVehicle && (
            <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
              <label className="text-sm font-medium text-slate-700">Current Mileage (km):</label>
              <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-32 border border-slate-300 rounded-md p-1.5 text-sm" placeholder="10500" />
            </div>
          )}
        </div>
      )}
"""
# Need to find the end of the vehicle search block
vehicle_block_end = r"          <\/button>\n        <\/div>\n      <\/div>\n      \)\}"
content = re.sub(vehicle_block_end, mileage_block, content)


with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
