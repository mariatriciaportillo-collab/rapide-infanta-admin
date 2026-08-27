'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

interface ResolvePartModalProps {
  onClose: () => void
  onResolve: (part: any) => void
  categoryId: string | null
  parentItemId: string
  childItemId: string
}

export function ResolvePartModal({ onClose, onResolve, categoryId, parentItemId, childItemId }: ResolvePartModalProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>("")

  const handleSelectPart = (part: any) => {
    onResolve(part)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Select Part for Category</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Please select the specific part that belongs to this category for the customer's vehicle.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Products</label>
            <PartSearchSelector 
              selectedPartId={selectedPartId}
              setSelectedPartId={setSelectedPartId}
              onSelectPart={handleSelectPart}
              categoryIdFilter={categoryId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
