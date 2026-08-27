import re

content = """'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Edit, Package, Loader2, Printer } from 'lucide-react'

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
        .select('*, package_items(*, labor_services(*), parts(*, brands(name)), part_categories(name))')
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
  
  const laborItems = items.filter((i: any) => i.item_type === 'LABOR')
  const partItems = items.filter((i: any) => i.item_type === 'PART')

  let laborRegularValue = 0
  let partsRegularValue = 0
  let productCost = 0
  let hasCategoryParts = false

  laborItems.forEach((item: any) => {
    const qty = Number(item.quantity) || 1
    const sellingPrice = Number(item.labor_services?.rate) || 0
    laborRegularValue += (sellingPrice * qty)
  })

  partItems.forEach((item: any) => {
    if (item.is_category) {
      hasCategoryParts = true
      return
    }
    const qty = Number(item.quantity) || 1
    const sellingPrice = Number(item.parts?.selling_price) || 0
    partsRegularValue += (sellingPrice * qty)
    productCost += (Number(item.parts?.cost) || 0) * qty
  })

  const regularValue = laborRegularValue + partsRegularValue
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
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
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Printer size={20} className="text-slate-600" /> Line Items Printout Options
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">HIDE LABOR</div>
                <div className="text-slate-800 font-medium">{pkg.hide_labor ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">HIDE PARTS</div>
                <div className="text-slate-800 font-medium">{pkg.hide_parts ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">SHOW CODE</div>
                <div className="text-slate-800 font-medium">{pkg.display_package_code ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">HIDE AMOUNTS</div>
                <div className="text-slate-800 font-medium">{pkg.hide_amounts ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">REPLACEMENT TEXT</div>
              <div className="text-slate-800 font-medium">{pkg.replacement_text || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pricing Summary</h2>
          <div className="flex flex-col gap-4">
            
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span>Labor Regular Value</span>
              <span className="font-medium">
                ₱{laborRegularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span>Parts Regular Value</span>
              <span className="font-medium">
                ₱{partsRegularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-800 border-t border-slate-200 pt-4 mt-2">
              <span className="font-bold">Regular Value</span>
              <span className="font-bold text-lg flex items-center gap-2">
                ₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {hasCategoryParts && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded tracking-wide">+ Variable</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-4">
              <span className="font-bold">Package Price</span>
              <span className="font-black text-2xl text-blue-700">
                ₱{pkgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {savings > 0 && !hasCategoryParts && (
              <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
                <span className="font-bold text-sm">Customer Savings</span>
                <span className="font-black text-lg">
                  ₱{savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            {productCost > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Est. Fixed Product Cost</span>
                <span className="font-mono">₱{productCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Included Labor ({laborItems.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-50/50 text-indigo-800 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-bold border-b border-slate-200">Labor / Service</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-32">Rate</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-24">Hours / Qty</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laborItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No labor added yet.
                  </td>
                </tr>
              ) : (
                laborItems.map((item: any, i: number) => {
                  const name = item.labor_services?.name || 'Unknown Item'
                  const qty = Number(item.quantity) || 1
                  const sellingPrice = Number(item.labor_services?.rate) || 0
                  const amount = sellingPrice * qty

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{name}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        ₱{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">{qty}</td>
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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Parts & Materials ({partItems.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/50 text-emerald-800 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-bold border-b border-slate-200">Part / Product</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200">Type</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-24">Qty</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-28">Price</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No parts or materials added yet.
                  </td>
                </tr>
              ) : (
                partItems.map((item: any, i: number) => {
                  const qty = Number(item.quantity) || 1
                  
                  if (item.is_category) {
                    const name = item.part_categories?.name || 'Unknown Category'
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">Category-based</span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">{qty}</td>
                        <td className="px-6 py-4 text-right text-slate-400">—</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-400">—</td>
                      </tr>
                    )
                  } else {
                    const name = item.parts?.name || 'Unknown Item'
                    const sellingPrice = Number(item.parts?.selling_price) || 0
                    const amount = sellingPrice * qty
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{name}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.parts?.part_number || 'No PN'} • {item.parts?.brands?.name || 'No Brand'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">Fixed Product</span>
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
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
"""
with open('src/app/(dashboard)/packages/[id]/page.tsx', 'w') as f:
    f.write(content)
