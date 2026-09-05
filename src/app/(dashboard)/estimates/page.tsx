import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function EstimatesPage() {
  const supabase = await createClient()

  // Fetch estimates ordered by newest first
  const { data: estimates, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Estimates</h1>
        <Link 
          href="/estimates/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          New Estimate
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
          Error loading estimates: {error.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Quote No.</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {estimates?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No estimates found. Create your first one!
                </td>
              </tr>
            ) : (
              estimates?.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"><Link href={`/estimates/${q.id}`}>{q.estimate_number}</Link></td>
                  <td className="px-4 py-3">
                    {q.created_at ? format(new Date(q.created_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{q.customer_name}</div>
                    <div className="text-xs text-slate-500">{q.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{q.vehicle_plate}</div>
                    <div className="text-xs text-slate-500">{q.vehicle_make} {q.vehicle_model}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-right">
                    ₱{Number(q.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                      ${q.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        q.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
