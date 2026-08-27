'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

interface PackageResolveModalProps {
  pkg: any
  onClose: () => void
  onApply: (resolvedParts: Record<string, any>) => void
}

export function PackageResolveModal({ pkg, onClose, onApply }: PackageResolveModalProps) {
  const categoryItems = (pkg.package_items || []).filter((pi: any) => pi.is_category)
  const [selections, setSelections] = useState<Record<string, any>>({})

  const isComplete = categoryItems.every((ci: any) => selections[ci.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Select Package Parts</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {categoryItems.map((ci: any) => (
            <div key={ci.id}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ci.part_categories?.name || 'Category'}
              </label>
              <PartSearchSelector 
                selectedPartId={selections[ci.id]?.id || ""}
                setSelectedPartId={() => {}}
                onSelectPart={(part) => {
                  setSelections(prev => ({ ...prev, [ci.id]: part }))
                }}
                categoryIdFilter={ci.part_category_id}
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded transition"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => onApply(selections)} 
            disabled={!isComplete} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
