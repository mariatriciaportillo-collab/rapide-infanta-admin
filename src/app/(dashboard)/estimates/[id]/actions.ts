'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startJobEstimate(estimateId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('estimates')
    .update({ status: 'JOB STARTED' })
    .eq('id', estimateId)

  if (error) {
    throw new Error('Failed to start job: ' + error.message)
  }

  revalidatePath(`/estimates/${estimateId}`)
  
  return { success: true }
}
