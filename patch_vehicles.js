const fs = require('fs');

// Patch 1: /vehicles/new/page.tsx
let f1 = fs.readFileSync('src/app/(dashboard)/vehicles/new/page.tsx', 'utf8');
f1 = f1.replace(
  /if \(\!make\.trim\(\) \|\| \!model\.trim\(\)\) \{\s*setError\("Make and Model are required\."\)/,
  'if (!plate.trim()) { setError("Plate Number is required."); setIsSubmitting(false); return; }\n    if (!make.trim()) { setError("Make is required."); setIsSubmitting(false); return; }\n    if (!model.trim()) { setError("Model is required."); setIsSubmitting(false); return; }\n    if (!year.trim()) { setError("Year is required.");'
);
fs.writeFileSync('src/app/(dashboard)/vehicles/new/page.tsx', f1);

// Patch 2: /vehicles/[id]/edit/page.tsx
let f2 = fs.readFileSync('src/app/(dashboard)/vehicles/[id]/edit/page.tsx', 'utf8');
f2 = f2.replace(
  /if \(\!make\.trim\(\) \|\| \!model\.trim\(\)\) \{\s*setError\("Make and Model are required\."\)/,
  'if (!plate.trim()) { setError("Plate Number is required."); setIsSubmitting(false); return; }\n    if (!make.trim()) { setError("Make is required."); setIsSubmitting(false); return; }\n    if (!model.trim()) { setError("Model is required."); setIsSubmitting(false); return; }\n    if (!year.toString().trim()) { setError("Year is required.");'
);
fs.writeFileSync('src/app/(dashboard)/vehicles/[id]/edit/page.tsx', f2);

// Patch 3: QuotationForm.tsx
let f3 = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');
f3 = f3.replace(
  /const normalizedPlate = vehiclePlate\.replace\(\/\[\^A-Z0-9\]\/ig, ''\)\.toUpperCase\(\)\n\s+if \(\!normalizedPlate && \(vehicleMake \|\| vehicleModel \|\| vehicleYear\)\) \{\n\s+setError\("Plate Number is required to create the vehicle\."\)\n\s+return\n\s+\}/,
  `const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()
    if (vehicleMake || vehicleModel || vehicleYear || normalizedPlate) {
      if (!normalizedPlate) { setError("Plate Number is required."); return; }
      if (!vehicleMake) { setError("Make is required."); return; }
      if (!vehicleModel) { setError("Model is required."); return; }
      if (!vehicleYear) { setError("Year is required."); return; }
    }`
);
f3 = f3.replace(
  /if \(\!normalizedPlate && \(vehicleMake \|\| vehicleModel \|\| vehicleYear\)\) \{\n\s+setError\("Plate Number is required to create the vehicle\."\)\n\s+setIsAddingVehicle\(false\)\n\s+return\n\s+\}/,
  `if (!normalizedPlate) { setError("Plate Number is required."); setIsAddingVehicle(false); return; }
      if (!vehicleMake) { setError("Make is required."); setIsAddingVehicle(false); return; }
      if (!vehicleModel) { setError("Model is required."); setIsAddingVehicle(false); return; }
      if (!vehicleYear) { setError("Year is required."); setIsAddingVehicle(false); return; }`
);
// Mark them with red asterisks in the UI inside QuotationForm
f3 = f3.replace(
  /<label className="block text-sm font-medium text-slate-700 mb-1">Make<\/label>/g,
  '<label className="block text-sm font-medium text-slate-700 mb-1">Make <span className="text-red-500">*</span></label>'
);
f3 = f3.replace(
  /<label className="block text-sm font-medium text-slate-700 mb-1">Model<\/label>/g,
  '<label className="block text-sm font-medium text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>'
);
f3 = f3.replace(
  /<label className="block text-sm font-medium text-slate-700 mb-1">Year<\/label>/g,
  '<label className="block text-sm font-medium text-slate-700 mb-1">Year <span className="text-red-500">*</span></label>'
);
f3 = f3.replace(
  /<label className="block text-sm font-medium text-slate-700 mb-1">Plate Number<\/label>/g,
  '<label className="block text-sm font-medium text-slate-700 mb-1">Plate Number <span className="text-red-500">*</span></label>'
);
fs.writeFileSync('src/components/quotations/QuotationForm.tsx', f3);
