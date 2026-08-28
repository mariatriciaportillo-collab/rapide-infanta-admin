import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Remove the entire massive grid block that used to render Customer Details & Vehicle Details inline
grid_pattern = r"\{\(isAddingCustomer \|\| isEditingCustomer \|\| isAddingVehicle \|\| isEditingVehicle\) && \([\s\S]*?\{\/\* SECTION 1: PACKAGES \*\/\}"
# Wait, my previous script left `{/* SECTION 1: PACKAGES */}` below the grid. Let's find exactly the boundaries.

# I'll just find the start of the grid condition:
grid_start = r"      \{\(isAddingCustomer \|\| isEditingCustomer \|\| isAddingVehicle \|\| isEditingVehicle\) && \(\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6\">"

# I need to match everything up to SECTION 1: PACKAGES.
grid_full_pattern = grid_start + r"[\s\S]*?\{\/\* SECTION 1: PACKAGES \*\/\}"

service_details_block = """      {/* Service Details */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Service Advisor</label>
          <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 text-base" placeholder="Name..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current Mileage (km)</label>
          <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border border-slate-300 rounded-lg p-3 text-base" placeholder="10500" />
        </div>
      </div>

      {/* SECTION 1: PACKAGES */}"""

if "{/* Service Details */}" not in content:
    content = re.sub(grid_full_pattern, service_details_block, content)


# 2. Append the Modals to the end of the return statement (right before closing </form>)
# Wait, QuotationForm returns <form ...> ... </form>. Let's insert them right before </form>.
# I can also insert them right before the very last </div> if it's not a form.
# Let's check what it is.
