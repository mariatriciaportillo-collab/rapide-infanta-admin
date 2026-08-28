import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Add states for VIN and Engine Capacity
state_pattern = r"const \[vehiclePlate, setVehiclePlate\] = useState\(''\)"
state_repl = r"const [vehiclePlate, setVehiclePlate] = useState('')\n  const [vin, setVin] = useState('')\n  const [engineCapacity, setEngineCapacity] = useState('')"
content = re.sub(state_pattern, state_repl, content)

# 2. Update handleClearCustomer to reset them
clear_pattern = r"setVehiclePlate\(''\)\n\s+setVehicleMake\(''\)"
clear_repl = r"setVehiclePlate('')\n    setVin('')\n    setEngineCapacity('')\n    setVehicleMake('')"
content = re.sub(clear_pattern, clear_repl, content)

# 3. Update handleSelectVehicle to load them
select_veh_pattern = r"setVehiclePlate\(vehicle\.plate_number\)\n\s+setVehicleMake"
select_veh_repl = r"setVehiclePlate(vehicle.plate_number)\n    setVin(vehicle.vin || '')\n    setEngineCapacity(vehicle.engine_capacity || '')\n    setVehicleMake"
content = re.sub(select_veh_pattern, select_veh_repl, content)

# Also there's a clear action in the "X" button for vehicle search. Let's find it.
x_btn_pattern = r"setVehiclePlate\(''\)\n\s+setVehicleMake\(''\)\n\s+setVehicleModel\(''\)\n\s+setVehicleYear\(''\)\n\s+setVehicleTransmission\(''\)\n\s+setMileage\(''\)"
x_btn_repl = r"setVehiclePlate('')\n                setVin('')\n                setEngineCapacity('')\n                setVehicleMake('')\n                setVehicleModel('')\n                setVehicleYear('')\n                setVehicleTransmission('')\n                setMileage('')"
content = re.sub(x_btn_pattern, x_btn_repl, content)

# 4. Update payload for handleCreateNewCustomer
create_veh_pattern = r"plate_number: normalizedPlate,\n\s+make: vehicleMake \|\| null,"
create_veh_repl = r"plate_number: normalizedPlate,\n        vin: vin.trim() || null,\n        engine_capacity: engineCapacity.trim() || null,\n        make: vehicleMake || null,"
content = re.sub(create_veh_pattern, create_veh_repl, content)

# 5. Update payload for handleSaveVehicleChanges
save_veh_pattern = r"plate_number: vehiclePlate\.toUpperCase\(\),\n\s+make: vehicleMake,"
save_veh_repl = r"plate_number: vehiclePlate.toUpperCase(),\n      vin: vin.trim() || null,\n      engine_capacity: engineCapacity.trim() || null,\n      make: vehicleMake,"
content = re.sub(save_veh_pattern, save_veh_repl, content)

# 6. Update Customer Modal (Optional Vehicle section) - Though user only specified updating Vehicle modal. 
# "Update both: Add New Vehicle, Edit Vehicle" 
# Oh, the first vehicle section is in Customer Modal! Let's update it.
cust_veh_pattern = r"""<div className="col-span-2">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Plate Number<\/label>\n\s+<input type="text" value=\{vehiclePlate\} onChange=\{e => setVehiclePlate\(e\.target\.value\.toUpperCase\(\)\)\} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" \/>\n\s+<\/div>"""
cust_veh_repl = r"""<div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                      <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chassis Number / VIN</label>
                      <input type="text" value={vin} onChange={e => setVin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="KNCSHX..." />
                    </div>"""
content = re.sub(cust_veh_pattern, cust_veh_repl, content)

# Also add Engine Capacity to the Customer Modal vehicle section:
# Currently it has Transmission in col-span-1. Let's adjust so it fits nicely.
# Row 3: Year | Engine Capacity
# Row 4: Transmission
cust_veh_row3_pattern = r"""<div className="col-span-1">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Year<\/label>\n\s+<input type="text" value=\{vehicleYear\} onChange=\{e => setVehicleYear\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" \/>\n\s+<\/div>\n\s+<div className="col-span-1">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Transmission<\/label>\n\s+<select value=\{vehicleTransmission\}"""
cust_veh_row3_repl = r"""<div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                      <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Engine Capacity</label>
                      <input type="text" value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2.8L" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                      <select value={vehicleTransmission}"""
content = re.sub(cust_veh_row3_pattern, cust_veh_row3_repl, content)

# 7. Update Vehicle Modal layout
# Currently:
#               <div className="grid grid-cols-2 gap-4">
#                 <div className="col-span-2">
#                   <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
veh_modal_pattern = r"""<div className="col-span-2">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Plate Number \*\<\/label>\n\s+<input type="text" value=\{vehiclePlate\} onChange=\{e => setVehiclePlate\(e\.target\.value\.toUpperCase\(\)\)\} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" \/>\n\s+<\/div>"""
veh_modal_repl = r"""<div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
                  <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC-1234" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chassis Number / VIN</label>
                  <input type="text" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="KNCSHX..." />
                </div>"""
content = re.sub(veh_modal_pattern, veh_modal_repl, content)

veh_row3_pattern = r"""<div className="col-span-1">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Year<\/label>\n\s+<input type="text" value=\{vehicleYear\} onChange=\{e => setVehicleYear\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" \/>\n\s+<\/div>\n\s+<div className="col-span-1">\n\s+<label className="block text-sm font-medium text-slate-700 mb-1">Transmission<\/label>\n\s+<select value=\{vehicleTransmission\}"""
veh_row3_repl = r"""<div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2020" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Engine Capacity</label>
                  <input type="text" value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2.8L" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                  <select value={vehicleTransmission}"""
content = re.sub(veh_row3_pattern, veh_row3_repl, content)

# 8. Reduce padding and spacing
# Replace mb-6 with mb-4 everywhere
content = content.replace("mb-6", "mb-4")
# Replace mb-8 with mb-4 everywhere
content = content.replace("mb-8", "mb-4")
# Replace p-6 with p-4 everywhere
content = content.replace("p-6", "p-4")
# Replace gap-6 with gap-4
content = content.replace("gap-6", "gap-4")

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
