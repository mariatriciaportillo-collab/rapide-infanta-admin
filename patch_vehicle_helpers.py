import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Add formatVehicle helper at the top or inside the component
# I will put it right before the component declaration if possible.
# Actually, I'll put it right after formatCustomerName import, or just inside the file.
format_helper = """
const formatVehicleName = (v: any) => {
  if (!v) return '';
  const make = v.make || '';
  const model = v.model || '';
  const year = v.year ? ` ${v.year}` : '';
  const plate = v.plate_number || '';
  
  const base = `${make} ${model}${year}`.trim();
  if (base && plate) return `${base.toUpperCase()} — ${plate.toUpperCase()}`;
  if (plate) return plate.toUpperCase();
  return base.toUpperCase();
}
"""

if "const formatVehicleName =" not in content:
    content = content.replace("export default function QuotationForm({", format_helper + "\nexport default function QuotationForm({")


# Add state variables
state_pattern = r"const \[customerSearch, setCustomerSearch\] = useState\(''\)"
new_state = """const [customerSearch, setCustomerSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const vehicleSearchRef = useRef<HTMLDivElement>(null)"""

if "vehicleSearch" not in content:
    content = re.sub(state_pattern, new_state, content)


# Update handleClickOutside
old_click = r"if \(searchRef\.current && \!searchRef\.current\.contains\(event\.target as Node\)\) \{\n\s+setShowDropdown\(false\)\n\s+\}"
new_click = """if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (vehicleSearchRef.current && !vehicleSearchRef.current.contains(event.target as Node)) {
        setShowVehicleDropdown(false)
      }"""

if "setShowVehicleDropdown(false)" not in content:
    content = re.sub(old_click, new_click, content)


# Update handleSelectVehicle
old_select_veh = r"const handleSelectVehicle = \(vehicle: any\) => \{\n\s+setSelectedVehicleId\(vehicle\.id\)\n\s+setVehiclePlate\(vehicle\.plate_number\)\n\s+setVehicleMake\(vehicle\.make \|\| ''\)\n\s+setVehicleModel\(vehicle\.model \|\| ''\)\n\s+setVehicleYear\(vehicle\.year \? vehicle\.year\.toString\(\) : ''\)\n\s+setVehicleTransmission\(vehicle\.transmission \|\| ''\)\n\s+\}"
new_select_veh = """const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicleId(vehicle.id)
    setVehiclePlate(vehicle.plate_number)
    setVehicleMake(vehicle.make || '')
    setVehicleModel(vehicle.model || '')
    setVehicleYear(vehicle.year ? vehicle.year.toString() : '')
    setVehicleTransmission(vehicle.transmission || '')
    setVehicleSearch(formatVehicleName(vehicle))
    setShowVehicleDropdown(false)
  }"""

if "setVehicleSearch(formatVehicleName" not in content:
    content = re.sub(old_select_veh, new_select_veh, content)


# Update handleSelectCustomer to handle clearing vehicle search when customer changes
# wait, handleSelectCustomer already calls setSelectedVehicleId(null), but let's make sure it resets vehicleSearch
old_cust_select = r"setVehicleTransmission\(''\)\n\s+setMileage\(''\)\n\s+\}"
new_cust_select = """setVehicleTransmission('')
      setMileage('')
      setVehicleSearch('')
    }"""
content = re.sub(old_cust_select, new_cust_select, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
