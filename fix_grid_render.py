import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Clean out the broken `)}` at the end first
content = content.replace("        )}\n      </div>\n      )}\n\n      {/* SECTION 1: PACKAGES */}", "      </div>\n\n      {/* SECTION 1: PACKAGES */}")
content = content.replace("            )}\n          </div>\n        </div>\n        )}\n      </div>", "          </div>\n        </div>\n      </div>")

# Now apply wrapping properly using a more generic split
# The Grid block starts exactly here:
#       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
#         {/* Customer Details */}

grid_pattern = r"(      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6\">\n\s+\{\/\* Customer Details \*\/\}\n\s+<div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">)"

grid_replacement = r"""      {(!selectedCustomerId || isEditingCustomer || !selectedVehicleId || isEditingVehicle || isAddingVehicle) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        {(!selectedCustomerId || isEditingCustomer) && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">"""
content = re.sub(grid_pattern, grid_replacement, content)

# Now for Vehicle Details
vehicle_pattern = r"(        \{\/\* Vehicle Details \*\/\}\n\s+<div className=\"bg-white border border-slate-200 rounded-lg shadow-sm p-6\">)"
vehicle_replacement = r"""        {/* Vehicle Details */}
        {(!selectedCustomerId || !selectedVehicleId || isEditingVehicle || isAddingVehicle) && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">"""

# Before applying vehicle replacement, we need to close the Customer Details card!
# It ends at `</div>\n        </div>\n\n        {/* Vehicle Details */}`
customer_end_pattern = r"(              <\/div>\n            \)\}\n          <\/div>\n        <\/div>)\n\n\s+\{\/\* Vehicle Details \*\/\}"
customer_end_replacement = r"\1\n        )}\n\n        {/* Vehicle Details */}"
content = re.sub(customer_end_pattern, customer_end_replacement, content)

content = re.sub(vehicle_pattern, vehicle_replacement, content)

# Now we need to close Vehicle Details and the Grid itself.
# Vehicle Details ends at:
#                 </button>
#               </div>
#             )}
#           </div>
#         </div>
#       </div>
# 
#       {/* SECTION 1: PACKAGES */}
vehicle_end_pattern = r"(            \)\}\n          <\/div>\n        <\/div>)\n      <\/div>\n\n\s+\{\/\* SECTION 1: PACKAGES \*\/\}"
vehicle_end_replacement = r"\1\n        )}\n      </div>\n      )}\n\n      {/* SECTION 1: PACKAGES */}"
content = re.sub(vehicle_end_pattern, vehicle_end_replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)

