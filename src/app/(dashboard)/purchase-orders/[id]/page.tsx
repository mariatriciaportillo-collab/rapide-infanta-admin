import { PurchaseOrderDetailClient } from './PurchaseOrderDetailClient'

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PurchaseOrderDetailClient id={resolvedParams.id} />
}
