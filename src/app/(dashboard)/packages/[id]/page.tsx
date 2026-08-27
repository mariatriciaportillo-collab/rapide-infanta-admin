'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Edit, Package, Loader2 } from 'lucide-react'

export default function ViewPackagePage() {
  const params = useParams()
  const supabase = createClient()
  const [pkg, setPkg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!params.id) return
      const { data } = await supabase
        .from('packages')
        .select('*, package_items(*, labor_charges(*), parts(*, brands(name)))')
        .eq('id', params.id)
        .single()
      
      setPkg(data)
      setLoading(false)
    }
    load()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        Loading package details...
      </div>
    )
  }

  if (!pkg) {
    return <div className="text-center p-12 text-slate-500">Package not found.</div>
  }

  const items = pkg.package_items || []
  let regularValue = 0
  let productCost = 0

  items.forEach((item: any) => {
    const isLabor = item.item_type === 'LABOR'
    const qty = Number(item.quantity) || 1
    const sellingPrice = isLabor ? Number(item.labor_charges?.rate) || 0 : Number(item.parts?.selling_price) || 0
    regularValue += (sellingPrice * qty)
    
    if (!isLabor) {
      productCost += (Number(item.parts?.cost) || 0) * qty
    }
  })

  const pkgPrice = Number(pkg.package_price) || 0
  const savings = Math.max(0, regularValue - pkgPrice)

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/packages" className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{pkg.name}</h1>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${
              pkg.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {pkg.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {pkg.package_code && <p className="text-slate-500 mt-1 font-mono text-sm">{pkg.package_code}</p>}
        </div>
        <Link 
          href={`/packages/${pkg.id}/edit`}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Edit size={18} /> Edit Package
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-600" /> Package Information
          </h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">CATEGORY</div>
              <div className="text-slate-800 font-medium">{pkg.category || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">CREATED</div>
              <div className="text-slate-800 font-medium">{new Date(pkg.created_at).toLocaleDateString()}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-bold text-slate-500 mb-1">DESCRIPTION / NOTES</div>
              <div className="text-slate-700 whitespace-pre-wrap">{pkg.description || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pricing Summary</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Regular Value</span>
              <span className="font-bold text-slate-800 text-lg">
                ₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-4">
              <span className="font-bold">Package Price</span>
              <span className="font-black text-2xl text-blue-700">
                ₱{pkgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {savings > 0 && (
              <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
                <span className="font-bold text-sm">Customer Savings</span>
                <span className="font-black text-lg">
                  ₱{savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            {productCost > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Est. Product Cost (Internal)</span>
                <span className="font-mono">₱{productCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Included Items ({items.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-bold border-b border-slate-200">Type</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200">Item</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Qty</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Selling Rate</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Regular Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No items in this package.
                  </td>
                </tr>
              ) : (
                items.map((item: any, i: number) => {
                  const isLabor = item.item_type === 'LABOR'
                  const title = isLabor ? 'Labor' : 'Part'
                  const color = isLabor ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  
                  const name = isLabor ? item.labor_charges?.service_name : item.parts?.name
                  const subtext = isLabor ? item.labor_charges?.category : `${item.parts?.part_number || 'No PN'} • ${item.parts?.brands?.name || 'No Brand'}`
                  
                  const qty = Number(item.quantity) || 1
                  const sellingPrice = isLabor ? Number(item.labor_charges?.rate) || 0 : Number(item.parts?.selling_price) || 0
                  const amount = sellingPrice * qty

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${color}`}>
                          {title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{name || 'Unknown Item'}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{subtext}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">{qty}</td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        ₱{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
