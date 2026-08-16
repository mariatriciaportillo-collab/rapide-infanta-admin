'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

export type ComboboxOption = {
  id: string
  name: string
  subtext?: string
}

type Props = {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className = ""
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(o => 
      o.name.toLowerCase().includes(query) || 
      (o.subtext && o.subtext.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border border-slate-300 rounded-md p-3 bg-white text-left focus:outline-none focus:border-blue-500 shadow-sm"
      >
        <span className={`block truncate ${selectedOption ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-72 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-slate-100 flex items-center">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              className="w-full focus:outline-none text-sm text-slate-700 bg-transparent"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus // Automatically focus when dropdown opens
            />
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-center text-slate-500">No results found.</div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-sm text-left transition-colors hover:bg-slate-100 ${value === option.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                >
                  <div>
                    <div className="truncate">{option.name}</div>
                    {option.subtext && (
                      <div className={`text-xs truncate ${value === option.id ? 'text-blue-500' : 'text-slate-400'}`}>
                        {option.subtext}
                      </div>
                    )}
                  </div>
                  {value === option.id && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
