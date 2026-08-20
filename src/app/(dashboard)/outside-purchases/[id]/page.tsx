import { OutsidePurchaseDetailClient } from './OutsidePurchaseDetailClient'

export default async function OutsidePurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <OutsidePurchaseDetailClient id={resolvedParams.id} />
}
