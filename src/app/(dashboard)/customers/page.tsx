import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, User, Phone, Car, Building2, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { formatCustomerName, formatContactPerson } from '@/utils/customer'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { q } = await searchParams

  let query = supabase
    .from('customers')
    .select('*, vehicles(count)')
    .order('created_at', { ascending: false })

  if (q) {
    // Search by all possible name fields or mobile or tin
    query = query.or(`name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,contact_person.ilike.%${q}%,contact_first_name.ilike.%${q}%,contact_last_name.ilike.%${q}%,mobile.ilike.%${q}%,tin.ilike.%${q}%`)
  }

  const { data: customers, error } = await query

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Customers</h2>
        <Link 
          href="/customers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <form className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search customer, company name, contact person, mobile..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading customers: {error.message}
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Customer / Company</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Vehicles</th>
                <th className="px-6 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No customers found. {q && 'Try a different search.'}
                  </td>
                </tr>
              ) : (
                customers?.map((customer) => {
                  const displayName = formatCustomerName(customer)
                  const displayContactPerson = formatContactPerson(customer)
                  
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-2">
                          {customer.customer_type === 'company' ? (
                            <Building2 size={16} className="text-slate-400" />
                          ) : (
                            <User size={16} className="text-slate-400" />
                          )}
                          {displayName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider
                          ${customer.customer_type === 'company' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}
                        >
                          {customer.customer_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {customer.customer_type === 'company' && displayContactPerson && (
                            <span className="text-slate-700 font-medium text-xs">Attn: {displayContactPerson}</span>
                          )}
                          {customer.mobile ? (
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Phone size={14} className="text-slate-400" />
                              {customer.mobile}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">No mobile</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Car size={16} className="text-slate-400" />
                          {customer.vehicles[0]?.count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {format(new Date(customer.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
