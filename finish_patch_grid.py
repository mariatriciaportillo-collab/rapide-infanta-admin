import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# For vehicle card:
# find:
#             )}
#           </div>
#         </div>
#       </div>
#
#       {/* SECTION 1: PACKAGES */}

vehicle_card_end = r"            \)\}\n          <\/div>\n        <\/div>\n      <\/div>\n\n\s+\{\/\* SECTION 1: PACKAGES \*\/\}"
vehicle_card_end_replacement = r"""            )}
          </div>
        </div>
        )}
      </div>

      {/* SECTION 1: PACKAGES */}"""

content = re.sub(vehicle_card_end, vehicle_card_end_replacement, content)

# One edge case: we shouldn't render the `grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6` if it's completely empty, otherwise it adds a massive 6 gap at the top.
# So I will wrap the entire grid with a condition.
grid_start = r"      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6\">\n        \{\/\* Customer Details \*\/\}\n        \{\(\!selectedCustomerId \|\| isEditingCustomer\) && \("

grid_start_replacement = r"""      {(!selectedCustomerId || isEditingCustomer || !selectedVehicleId || isEditingVehicle || isAddingVehicle) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        {(!selectedCustomerId || isEditingCustomer) && ("""

content = re.sub(grid_start, grid_start_replacement, content)

grid_end = r"        \)\}\n      <\/div>\n\n\s+\{\/\* SECTION 1: PACKAGES \*\/\}"
grid_end_replacement = r"""        )}
      </div>
      )}

      {/* SECTION 1: PACKAGES */}"""
content = re.sub(grid_end, grid_end_replacement, content)


with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
