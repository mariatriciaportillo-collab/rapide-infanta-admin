'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  selectedYear: string
  setSelectedYear: (val: string) => void
  disabled?: boolean
}

export function YearSelector({ selectedYear, setSelectedYear, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate years from current year down to 1980
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 1980
    const list = []
    for (let y = currentYear; y >= startYear; y--) {
      list.push(y.toString())
    }
    return list
  }, [])

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredYears = years.filter(y => y.includes(search))

  const handleSelect = (year: string) => {
    setSelectedYear(year)
    setSearch('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
      <div 
        className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'border-slate-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedYear ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedYear || 'Search or select year...'}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input 
              type="text"
              autoFocus
              placeholder="Search year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredYears.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 text-center">No matching year found.</div>
            ) : (
              <>
                <div 
                  onClick={() => handleSelect('')}
                  className={`p-2 px-3 text-sm cursor-pointer hover:bg-slate-50 transition text-slate-500 italic border-b border-slate-100`}
                >
                  Clear selection
                </div>
                {filteredYears.map(y => (
                  <div 
                    key={y}
                    onClick={() => handleSelect(y)}
                    className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedYear === y ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                  >
                    {y}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
