'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PackageForm from '../../components/PackageForm'
import { Loader2 } from 'lucide-react'

export default function EditPackagePage() {
  const params = useParams()
  const supabase = createClient()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!params.id) return
      const { data: pkg } = await supabase
        .from('packages')
        .select('*, package_items(*, labor_services(*), parts(*, brands(name)))')
        .eq('id', params.id)
        .single()
      
      setData(pkg)
      setLoading(false)
    }
    load()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        Loading package data...
      </div>
    )
  }

  if (!data) {
    return <div className="text-center p-12 text-slate-500">Package not found.</div>
  }

  return <PackageForm initialData={data} />
}
