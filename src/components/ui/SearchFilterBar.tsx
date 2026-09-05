import React from 'react'
import { Search } from 'lucide-react'

export function SearchFilterBar({ 
  searchQuery, 
  onSearchChange, 
  searchPlaceholder = "Search...", 
  children 
}: { 
  searchQuery?: string, 
  onSearchChange?: (val: string) => void, 
  searchPlaceholder?: string, 
  children?: React.ReactNode 
}) {
  return (
    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0">
      {onSearchChange !== undefined ? (
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : <div />}
      
      {children && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  )
}
