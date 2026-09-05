'use client'

import { useState } from 'react'

export default function ReportPlaceholderPage() {
  const [filter, setFilter] = useState('This Month')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Invoices Report</h1>
        <div className="flex gap-2">
          {['Today', 'This Week', 'This Month', 'This Year'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 text-center text-slate-500">
        This report is currently under construction. Data models and aggregations are being built.
      </div>
    </div>
  )
}
