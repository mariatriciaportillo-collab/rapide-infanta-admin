import { ReceiveItemsClient } from './ReceiveItemsClient'

export default async function ReceiveItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReceiveItemsClient id={resolvedParams.id} />
}
