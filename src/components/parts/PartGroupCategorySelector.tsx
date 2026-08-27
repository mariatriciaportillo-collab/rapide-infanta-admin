'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronDown, Plus, X } from 'lucide-react'

export type PartGroup = { id: string; name: string }
export type PartCategory = { id: string; group_id: string; name: string }

type Props = {
  selectedGroupId: string
  setSelectedGroupId: (val: string) => void
  selectedCategoryId: string
  setSelectedCategoryId: (val: string) => void
  disabled?: boolean
}

export function PartGroupCategorySelector({ 
  selectedGroupId, 
  setSelectedGroupId, 
  selectedCategoryId, 
  setSelectedCategoryId, 
  disabled 
}: Props) {
  const supabase = createClient()
  
  // Data
  const [groups, setGroups] = useState<PartGroup[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  
  // UI State
  const [groupSearch, setGroupSearch] = useState('')
  const [isGroupOpen, setIsGroupOpen] = useState(false)
  
  const [categorySearch, setCategorySearch] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  
  const groupRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  
  // Modal State - Group
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [groupModalError, setGroupModalError] = useState<string | null>(null)
  const [isSavingGroup, setIsSavingGroup] = useState(false)

  // Modal State - Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null)
  const [isSavingCategory, setIsSavingCategory] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchData()
  }, [])

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) setIsGroupOpen(false)
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchData = async () => {
    const { data: gData } = await supabase.from('part_groups').select('*').eq('is_active', true).order('name')
    if (gData) setGroups(gData)

    const { data: cData } = await supabase.from('part_categories').select('*').eq('is_active', true).order('name')
    if (cData) setCategories(cData)
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedCategoryId('') // Reset category when group changes
    setGroupSearch('')
    setIsGroupOpen(false)
  }

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCategorySearch('')
    setIsCategoryOpen(false)
  }

  const saveNewGroup = async () => {
    setGroupModalError(null)
    const cleanName = newGroupName.trim()
    if (!cleanName) return
    
    if (groups.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      setGroupModalError('This Group already exists.')
      return
    }

    setIsSavingGroup(true)
    const { data, error } = await supabase.from('part_groups').insert({ 
      name: cleanName
    }).select().single()
    
    setIsSavingGroup(false)

    if (error) {
      if (error.code === '23505') setGroupModalError('This Group already exists.')
      else setGroupModalError(error.message)
      return
    }

    if (data) {
      setGroups([...groups, data].sort((a, b) => a.name.localeCompare(b.name)))
      handleSelectGroup(data.id)
      setIsGroupModalOpen(false)
      setNewGroupName('')
    }
  }

  const saveNewCategory = async () => {
    setCategoryModalError(null)
    const cleanName = newCategoryName.trim()
    if (!cleanName || !selectedGroupId) return
    
    if (categories.some(s => s.group_id === selectedGroupId && s.name.toLowerCase() === cleanName.toLowerCase())) {
      setCategoryModalError('This Category already exists in this Group.')
      return
    }

    setIsSavingCategory(true)
    const { data, error } = await supabase.from('part_categories').insert({ 
      group_id: selectedGroupId,
      name: cleanName
    }).select().single()
    
    setIsSavingCategory(false)

    if (error) {
      if (error.code === '23505') setCategoryModalError('This Category already exists in this Group.')
      else setCategoryModalError(error.message)
      return
    }

    if (data) {
      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)))
      handleSelectCategory(data.id)
      setIsCategoryModalOpen(false)
      setNewCategoryName('')
    }
  }

  const filteredGroups = useMemo(() => 
    groups.filter(s => s.name.toLowerCase().includes(groupSearch.toLowerCase())), 
  [groups, groupSearch])
  
  const filteredCategories = useMemo(() => 
    categories
      .filter(c => c.group_id === selectedGroupId)
      .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())),
  [categories, selectedGroupId, categorySearch])

  const selectedGroup = groups.find(s => s.id === selectedGroupId)
  const selectedCategory = categories.find(s => s.id === selectedCategoryId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* GROUP SELECTOR */}
      <div className="relative" ref={groupRef}>
        <label className="block text-sm font-medium text-slate-700 mb-1">Group *</label>
        <div 
          className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'border-slate-300'}`}
          onClick={() => !disabled && setIsGroupOpen(!isGroupOpen)}
        >
          <span className={selectedGroup ? 'text-slate-900 font-medium' : 'text-slate-400'}>
            {selectedGroup?.name || 'Select...'}
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        {isGroupOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <input 
                type="text"
                autoFocus
                placeholder="Search groups..."
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">No matching groups.</div>
              ) : (
                filteredGroups.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleSelectGroup(s.id)}
                    className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedGroupId === s.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                  >
                    {s.name}
                  </div>
                ))
              )}
            </div>
            <div 
              className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
              onClick={() => { setIsGroupOpen(false); setIsGroupModalOpen(true); setGroupModalError(null); setNewGroupName(groupSearch) }}
            >
              <Plus size={16} /> Add New Group
            </div>
          </div>
        )}
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="relative" ref={categoryRef}>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
        <div 
          className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer ${disabled || !selectedGroupId ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'bg-white border-slate-300'}`}
          onClick={() => !disabled && selectedGroupId && setIsCategoryOpen(!isCategoryOpen)}
        >
          <span className={selectedCategory ? 'text-slate-900 font-medium' : 'text-slate-400'}>
            {!selectedGroupId ? 'Select a group first...' : (selectedCategory?.name || 'Select...')}
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        {isCategoryOpen && !disabled && selectedGroupId && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <input 
                type="text"
                autoFocus
                placeholder="Search categories..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">No matching categories.</div>
              ) : (
                filteredCategories.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleSelectCategory(s.id)}
                    className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedCategoryId === s.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                  >
                    {s.name}
                  </div>
                ))
              )}
            </div>
            <div 
              className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
              onClick={() => { setIsCategoryOpen(false); setIsCategoryModalOpen(true); setCategoryModalError(null); setNewCategoryName(categorySearch) }}
            >
              <Plus size={16} /> Add New Category
            </div>
          </div>
        )}
      </div>

      {/* NEW GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Group</h3>
              <button type="button" onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              {groupModalError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{groupModalError}</div>}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Group Name *</label>
                <input 
                  type="text" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Underchassis"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
              <button type="button" onClick={saveNewGroup} disabled={isSavingGroup || !newGroupName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition">
                {isSavingGroup ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CATEGORY MODAL */}
      {isCategoryModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Category</h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Under Group</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-600 font-medium">
                  {selectedGroup.name}
                </div>
              </div>
              {categoryModalError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{categoryModalError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Drive Shaft"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
              <button type="button" onClick={saveNewCategory} disabled={isSavingCategory || !newCategoryName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition">
                {isSavingCategory ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
