import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Update grid wrapping
# Replace: {(!selectedCustomerId || isEditingCustomer || !selectedVehicleId || isEditingVehicle || isAddingVehicle) && (
# With: {(isAddingCustomer || isEditingCustomer || isAddingVehicle || isEditingVehicle) && (
old_grid_start = r"\{\(\!selectedCustomerId \|\| isEditingCustomer \|\| \!selectedVehicleId \|\| isEditingVehicle \|\| isAddingVehicle\) && \("
new_grid_start = r"{(isAddingCustomer || isEditingCustomer || isAddingVehicle || isEditingVehicle) && ("
content = re.sub(old_grid_start, new_grid_start, content)

# 2. Update Customer Details wrapping
# Replace: {(!selectedCustomerId || isEditingCustomer) && (
# With: {(isAddingCustomer || isEditingCustomer) && (
old_cust_start = r"\{\(\!selectedCustomerId \|\| isEditingCustomer\) && \(\n\s+<div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">"
new_cust_start = r"{(isAddingCustomer || isEditingCustomer) && (\n        <div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">"
content = re.sub(old_cust_start, new_cust_start, content)

# 3. Update Vehicle Details wrapping
# Replace: {(!selectedCustomerId || !selectedVehicleId || isEditingVehicle || isAddingVehicle) && (
# With: {(isAddingCustomer || isAddingVehicle || isEditingVehicle) && (
old_veh_start = r"\{\(\!selectedCustomerId \|\| \!selectedVehicleId \|\| isEditingVehicle \|\| isAddingVehicle\) && \(\n\s+<div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">"
new_veh_start = r"{(isAddingCustomer || isAddingVehicle || isEditingVehicle) && (\n        <div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">"
content = re.sub(old_veh_start, new_veh_start, content)

# 4. Update the Customer Search Action for Add New Customer
# Old: setIsEditingCustomer(false) -> New: setIsAddingCustomer(true); setIsEditingCustomer(false);
old_add_cust = r"handleClearCustomer\(\)\n\s+setShowDropdown\(false\)\n\s+\}\}\n\s+className=\"bg-blue-50 text-blue-700"
new_add_cust = r"handleClearCustomer()\n                setIsAddingCustomer(true)\n                setShowDropdown(false)\n              }}\n              className=\"bg-blue-50 text-blue-700"
content = re.sub(old_add_cust, new_add_cust, content)

# 5. Fix Save Buttons for Customer
# Inside Customer Details, if isAddingCustomer, show "Cancel" and "Save New Customer"
# if isEditingCustomer, show "Cancel" and "Save Customer Changes"
customer_buttons_pattern = r"(\{\(isEditingCustomer\) && \([\s\S]*?<\/div>\n\s+\)\})"
new_customer_buttons = r"""
            {(isAddingCustomer || isEditingCustomer) && (
              <div className="col-span-2 mt-4 flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => {
                  if (isAddingCustomer) {
                    setIsAddingCustomer(false)
                  } else {
                    handleSelectCustomer(searchResults.find(c => c.id === selectedCustomerId) || { id: selectedCustomerId })
                    setIsEditingCustomer(false)
                  }
                }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancel
                </button>
                <button type="button" onClick={isAddingCustomer ? handleCreateNewCustomer : handleSaveCustomerChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                  {isAddingCustomer ? 'Save New Customer' : 'Save Customer Changes'}
                </button>
              </div>
            )}
"""
content = re.sub(r"\{\(isEditingCustomer\) && \([\s\S]*?<\/div>\n\s+\)\}", new_customer_buttons, content)

# Wait, the customer buttons originally checked {isEditingCustomer && ( ... )}, but now I need to find the exact existing block.
# Let's fix that regex if it doesn't match by replacing exactly:

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
