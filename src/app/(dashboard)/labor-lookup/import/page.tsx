'use client'

import { useState } from 'react'

export default function ImportPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleImport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/import-labor', { method: 'POST' })
      const data = await res.json()
      setResults(data)
    } catch (e: any) {
      setResults({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Run Labor Data Import (M/AT)</h1>
      <p className="mb-6 text-slate-600">
        This will read <code>public/dry_run_ready.json</code> and insert it using your active admin session.
      </p>
      
      <button 
        onClick={handleImport}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded font-medium disabled:bg-blue-300"
      >
        {loading ? 'Importing...' : 'Start Import'}
      </button>

      {results && (
        <div className="mt-8 p-4 bg-slate-50 border rounded-lg overflow-auto max-h-96 text-sm font-mono">
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
