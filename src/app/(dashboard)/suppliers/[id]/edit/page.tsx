import { EditSupplierClient } from './EditSupplierClient'

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  return <EditSupplierClient id={params.id} />
}
