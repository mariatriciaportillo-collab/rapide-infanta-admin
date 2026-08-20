import { StockSwapDetailClient } from './StockSwapDetailClient'

export default async function StockSwapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <StockSwapDetailClient id={resolvedParams.id} />
}
