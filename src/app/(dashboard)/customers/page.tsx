import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, User, Phone, Car } from 'lucide-react'
import { format } from 'date-fns'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { q } = await searchParams

  // We need to fetch customers and count their vehicles.
  // We can do this with a join, but Supabase JS syntax makes it easy to fetch related counts.
  let query = supabase
    .from('customers')
    .select('*, vehicles(count)')
    .order('created_at', { ascending: false })

  if (q) {
    // Search by name or mobile
    query = query.or(`name.ilike.%${q}%,mobile.ilike.%${q}%`)
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
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search customer name or mobile..."
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
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Vehicles</th>
                <th className="px-6 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No customers found. {q && 'Try a different search.'}
                  </td>
                </tr>
              ) : (
                customers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {customer.mobile ? (
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Phone size={14} className="text-slate-400" />
                            {customer.mobile}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No mobile</span>
                        )}
                        {customer.email && <span className="text-slate-500 text-xs">{customer.email}</span>}
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
