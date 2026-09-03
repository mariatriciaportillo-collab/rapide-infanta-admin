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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Estimates</h2>
        <Link 
          href="/estimate/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          New Estimate
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
          Error loading estimates: {error.message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Quote No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {estimates?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No estimates found. Create your first one!
                </td>
              </tr>
            ) : (
              estimates?.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{q.estimate_number}</td>
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
                  <td className="px-4 py-3 font-medium text-slate-900">
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
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link href={`/estimate/${q.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wider">
                      View
                    </Link>
                      {(() => {
                        const status = (q.status || '').toUpperCase();
                        const hasDownpayment = q.downpayment_amount > 0 || (q.payments && q.payments.length > 0);
                        const isConverted = q.is_converted || q.invoice_id || status === 'CONVERTED';
                        const isCompleted = status === 'COMPLETED';
                        const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED';
                        
                        return canEdit ? (
                          <Link href={`/estimate/${q.id}/edit`} className="text-amber-600 hover:text-amber-800 font-medium text-xs uppercase tracking-wider">
                            Edit
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider" title={hasDownpayment ? "Locked — Downpayment Received" : (isConverted ? "Locked — Converted" : "Locked")}>
                            Locked
                          </span>
                        );
                      })()}
                      <Link href={`/estimate/${q.id}/print`} className="text-slate-600 hover:text-slate-800 font-medium text-xs uppercase tracking-wider">
                      Print
                    </Link>
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
