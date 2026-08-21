'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useFloating, autoUpdate, flip, size } from '@floating-ui/react-dom'

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
  onAddNew?: (searchQuery: string) => void
  addNewLabel?: string
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className = "",
  onAddNew,
  addNewLabel = "+ Add New"
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const { x, y, strategy, refs, placement } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const isOutsideTrigger = refs.reference.current && !(refs.reference.current as Node).contains(target)
      const isOutsideFloating = refs.floating.current && !(refs.floating.current as Node).contains(target)
      
      if (isOutsideTrigger && isOutsideFloating) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, refs])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(o => 
      o.name.toLowerCase().includes(query) || 
      (o.subtext && o.subtext.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  const handleSelect = (id: string) => {
    onChange(id)
    setIsOpen(false)
    setSearchQuery('')
  }

  const isFlipped = placement.startsWith('top')

  return (
    <>
      {/* TRIGGER BUTTON */}
      <div 
        ref={refs.setReference}
        className={`w-full ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between border bg-white text-left focus:outline-none transition shadow-sm
            ${isOpen 
              ? `border-blue-500 z-10 relative ${isFlipped ? 'rounded-b-md border-t-white' : 'rounded-t-md border-b-white'}` 
              : 'rounded-md border-slate-300 hover:border-slate-400'
            }
          `}
          style={{ padding: '0.65rem 0.75rem' }}
        >
          <span className={`block truncate ${selectedOption ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronsUpDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {mounted && isOpen && createPortal(
        <div 
          ref={refs.setFloating}
          className={`bg-white border border-blue-500 shadow-xl flex flex-col overflow-hidden ${
            isFlipped ? 'rounded-t-md border-b-0' : 'rounded-b-md border-t-0'
          }`}
          style={{ 
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            maxHeight: '320px',
            marginTop: isFlipped ? '1px' : '-1px',
            zIndex: 99999 
          }}
        >
          {/* STICKY SEARCH HEADER */}
          <div className="sticky top-0 bg-white p-2 border-b border-slate-100 flex items-center shrink-0">
            <Search className="w-4 h-4 text-blue-500 mx-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              className="w-full focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent py-1.5"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') setIsOpen(false)
              }}
            />
          </div>

          {/* OPTIONS LIST */}
          <div className="overflow-y-auto p-1 flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              <div className="space-y-0.5">
                {filteredOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(option.id)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition flex items-center justify-between group ${
                      value === option.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="truncate pr-4">
                      <div className={`text-sm truncate ${value === option.id ? 'font-bold text-blue-700' : 'font-medium text-slate-800'}`}>
                        {option.name}
                      </div>
                      {option.subtext && (
                        <div className={`text-xs truncate ${value === option.id ? 'text-blue-500' : 'text-slate-500'}`}>
                          {option.subtext}
                        </div>
                      )}
                    </div>
                    {value === option.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                No results found.
              </div>
            )}
          </div>

          {/* OPTIONAL ADD NEW BUTTON */}
          {onAddNew && (
            <div className="p-2 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onAddNew(searchQuery)
                  setIsOpen(false)
                }}
                className="w-full text-center py-2 text-sm text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-md font-bold transition shadow-sm"
              >
                {addNewLabel}
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
