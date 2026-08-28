import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

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

export function QuotationForm({ initialData """

content = content.replace("export function QuotationForm({ initialData ", format_helper)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
