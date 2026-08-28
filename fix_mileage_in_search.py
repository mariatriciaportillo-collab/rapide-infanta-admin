import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# I added this block in the previous step:
#           {selectedVehicleId && !isEditingVehicle && (
#             <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
#               <label className="text-sm font-medium text-slate-700">Current Mileage (km):</label>
#               <input type="text" value={mileage} onChange={e => setMileage(e.target.value.replace(/[^0-9]/g, ''))} className="w-32 border border-slate-300 rounded-md p-1.5 text-sm" placeholder="10500" />
#             </div>
#           )}
# Let's remove it completely because it's now in the Service Details block!

mileage_widget_pattern = r"\s*\{\s*selectedVehicleId && \!isEditingVehicle && \(\s*<div className=\"mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit\">\s*<label className=\"text-sm font-medium text-slate-700\">Current Mileage \(km\):<\/label>\s*<input type=\"text\" value=\{mileage\} onChange=\{e => setMileage\(e\.target\.value\.replace\(\/\[\^0-9\]\/g, ''\)\)\} className=\"w-32 border border-slate-300 rounded-md p-1\.5 text-sm\" placeholder=\"10500\" \/>\s*<\/div>\s*\)\s*\}"

content = re.sub(mileage_widget_pattern, "", content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
