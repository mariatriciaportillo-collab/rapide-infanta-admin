import { StockAdjustmentDetailClient } from './StockAdjustmentDetailClient'

export default async function StockAdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <StockAdjustmentDetailClient id={resolvedParams.id} />
}
