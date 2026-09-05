import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CustomerServiceHistory } from '@/components/customers/CustomerServiceHistory'
import { notFound } from 'next/navigation'
import { ArrowLeft, Car, FileText, User as UserIcon, Building2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { formatCustomerName } from '@/utils/customer'

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Vehicle and Owner
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*, customers(*)')
    .eq('id', id)
    .single()

  if (vehicleError || !vehicle) {
    notFound()
  }

  // 2. Fetch Quotation History
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch Service History (Invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, vehicles(plate_number, make, model), invoice_items(description)')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  const owner = vehicle.customers
  const isCompany = owner?.customer_type?.toLowerCase() === 'company'

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/vehicles" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">Vehicle Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Vehicle & Owner Profile */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1 uppercase tracking-wider">{vehicle.plate_number}</h3>
                <div className="text-sm font-medium text-slate-500">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </div>
              </div>
              <Car size={32} className="text-slate-200" />
            </div>
            
            <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-slate-500">Transmission</span>
                <span className="text-slate-900 font-medium">{vehicle.transmission || 'Unknown'}</span>
                <span className="text-slate-500">Added</span>
                <span className="text-slate-900 font-medium">{format(new Date(vehicle.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {vehicle.notes && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{vehicle.notes}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
              <Link 
                href={`/vehicles/${id}/edit`}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition"
              >
                <Edit size={16} />
                Edit Vehicle
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {isCompany ? <Building2 size={18} className="text-slate-500" /> : <UserIcon size={18} className="text-slate-500" />}
                Owner
              </h3>
            </div>
            <div className="p-4">
              {owner ? (
                <div>
                  <div className="font-bold text-slate-800">{formatCustomerName(owner)}</div>
                  <div className="text-sm text-slate-500 mt-1 capitalize">{owner.customer_type}</div>
                  <Link href={`/customers/${owner.id}`} className="mt-4 block text-sm text-blue-600 hover:underline">
                    View full profile &rarr;
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">No owner assigned</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <CustomerServiceHistory invoices={invoices || []} vehicles={vehicle ? [vehicle] : []} />

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                Quotation History ({quotations?.length || 0})
              </h3>
            </div>
            
            {(!quotations || quotations.length === 0) ? (
              <div className="p-4 text-slate-500 text-sm italic">No quotations found for this vehicle.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Quote No</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quotations.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3">
                        <Link href={`/quotations/${q.id}`} className="font-medium text-blue-600 hover:underline">
                          {q.quote_number}
                        </Link>
                      </td>
                      <td className="px-6 py-3">{format(new Date(q.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        ₱{Number(q.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                          ${q.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                            q.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'}`}
                        >
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
