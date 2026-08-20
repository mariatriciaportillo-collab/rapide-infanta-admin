import { EditSupplierClient } from './EditSupplierClient'

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <EditSupplierClient id={resolvedParams.id} />
}
