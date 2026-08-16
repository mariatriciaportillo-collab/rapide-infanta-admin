import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Car, FileText, Phone, Mail, MapPin, Building2, User as UserIcon, Edit, Plus, FileSignature } from 'lucide-react'
import { format } from 'date-fns'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (customerError || !customer) {
    notFound()
  }

  // 2. Fetch Vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch Quotation History
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const isCompany = customer.customer_type === 'company'

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/customers" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">
          {isCompany ? 'Company Details' : 'Customer Details'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 relative">
            
            <div className="absolute top-6 right-6 flex gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                ${isCompany ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}
              >
                {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
                {customer.customer_type}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1 pr-24">{customer.name}</h3>
            
            {isCompany && customer.contact_person && (
              <div className="text-sm font-medium text-slate-500 mb-4">
                Contact: {customer.contact_person}
              </div>
            )}
            
            <div className="space-y-3 text-sm mt-6">
              {customer.mobile && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{customer.mobile} {customer.telephone ? `/ ${customer.telephone}` : ''}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-700 leading-relaxed">{customer.address}</span>
                </div>
              )}
              {isCompany && customer.tin && (
                <div className="flex items-start gap-3">
                  <FileSignature size={18} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-700">TIN: {customer.tin}</span>
                </div>
              )}
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Added {format(new Date(customer.created_at), 'PPP')}
              </div>
              <Link 
                href={`/customers/${id}/edit`}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
              >
                <Edit size={14} />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicles and History */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Vehicles */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Car size={18} className="text-slate-500" />
                {isCompany ? 'Fleet Vehicles' : 'Vehicles'} ({vehicles?.length || 0})
              </h3>
              <Link 
                href={`/vehicles/new?customer_id=${id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition shadow-sm"
              >
                <Plus size={16} />
                Add Vehicle
              </Link>
            </div>
            
            <div className="p-4">
              {(!vehicles || vehicles.length === 0) ? (
                <p className="text-slate-500 text-sm italic">No vehicles registered to this {isCompany ? 'company' : 'customer'}.</p>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {vehicles.map(v => (
                    <div key={v.id} className="border border-slate-200 rounded-md p-4 bg-slate-50 flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 text-lg mb-1">{v.make} {v.model} {v.year}</div>
                        <div className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider mb-2">
                          {v.plate_number}
                        </div>
                        {v.transmission && <div className="text-sm text-slate-600">Trans: {v.transmission}</div>}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/vehicles/${v.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quotation History */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                Quotation History ({quotations?.length || 0})
              </h3>
            </div>
            
            {(!quotations || quotations.length === 0) ? (
              <div className="p-4 text-slate-500 text-sm italic">No quotations found for this customer.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Quote No</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Vehicle</th>
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
                      <td className="px-6 py-3">{q.vehicle_plate}</td>
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
