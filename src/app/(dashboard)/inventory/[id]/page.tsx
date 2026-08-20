import { InventoryDetailClient } from './InventoryDetailClient'

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  return <InventoryDetailClient id={params.id} />
}
