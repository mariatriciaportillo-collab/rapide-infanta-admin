'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

export default function PartLaborRulesPage() {
  const supabase = createClient()
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadRules = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('part_labor_rules')
      .select(`
        *,
        labor:labor_id(name),
        triggers:part_labor_rule_triggers(
          parts:part_id(name)
        )
      `)
      .order('created_at', { ascending: false })
      
    if (data) setRules(data)
    setLoading(false)
  }

  useEffect(() => {
    loadRules()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete rule "${name}"?`)) {
      await supabase.from('part_labor_rules').delete().eq('id', id)
      loadRules()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('part_labor_rules').update({ active: !current }).eq('id', id)
    loadRules()
  }

  const filteredRules = rules.filter(r => {
    const term = search.toLowerCase()
    if (r.rule_name.toLowerCase().includes(term)) return true
    if (r.labor?.name?.toLowerCase().includes(term)) return true
    if (r.triggers?.some((t: any) => t.parts?.name?.toLowerCase().includes(term))) return true
    return false
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Part-to-Labor Rules</h1>
          <p className="text-slate-500">Automatically suggest labor when specific repair parts are added to Quotations or Estimates.</p>
        </div>
        <Link 
          href="/part-labor-rules/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Add Rule
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by rule, part, or labor..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Rule Name</th>
                <th className="px-4 py-3 font-semibold">Trigger Part(s)</th>
                <th className="px-4 py-3 font-semibold">Suggested Labor</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : filteredRules.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No rules found.</td></tr>
              ) : (
                filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{rule.rule_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-col gap-1">
                        {rule.triggers?.map((t: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {t.parts?.name || 'Unknown Part'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{rule.labor?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${rule.rule_type === 'COMBINATION' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {rule.rule_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => toggleActive(rule.id, rule.active)}
                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider transition ${rule.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {rule.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TableActions align="right">
                        <TableAction icon={Edit2} label="Edit Rule" href={`/part-labor-rules/${rule.id}/edit`} />
                        <TableAction icon={Trash2} label="Delete Rule" onClick={() => handleDelete(rule.id, rule.rule_name)} variant="destructive" />
                      </TableActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
