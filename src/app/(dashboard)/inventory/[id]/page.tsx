import { InventoryDetailClient } from './InventoryDetailClient'

export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <InventoryDetailClient id={resolvedParams.id} />
}
