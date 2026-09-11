import React from 'react'
import { X } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (val: string) => void
  currentValue?: string | null
}

export const ENGINE_OIL_CLASSIFICATIONS = [
  'Mineral',
  'Semi-Synthetic',
  'Fully Synthetic'
]

export function EngineOilClassificationModal({ isOpen, onClose, onSelect, currentValue }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800">Engine Oil Classification</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <p className="text-sm text-slate-600 mb-2">Please select the classification for this Engine Oil:</p>
          {ENGINE_OIL_CLASSIFICATIONS.map(cls => (
            <button
              key={cls}
              onClick={() => {
                onSelect(cls)
                onClose()
              }}
              className={`w-full text-left px-4 py-3 rounded-md transition border ${
                currentValue === cls 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
