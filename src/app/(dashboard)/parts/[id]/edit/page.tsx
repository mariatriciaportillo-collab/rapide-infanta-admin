import { EditPartClient } from './EditPartClient'

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // In Next.js 14+ params is typically a Promise in modern server components,
  // but just passing it to the client component is safest if it's treated generically.
  return <EditPartClient id={resolvedParams.id} />
}
