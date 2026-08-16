import { Suspense } from 'react'
import { AddReferenceRateClient } from './AddReferenceRateClient'

export default function AddReferenceRatePage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <AddReferenceRateClient />
    </Suspense>
  )
}
