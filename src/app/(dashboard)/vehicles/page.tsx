import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, Car, User, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { formatCustomerName } from '@/utils/customer'
import { UrlPagination } from '@/components/ui/UrlPagination'

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const q = params.q
  
  const currentPage = parseInt(params.page || '1', 10)
  const pageSize = 25

  let query = supabase
    .from('vehicles')
    .select('*, customers(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`plate_number.ilike.%${q}%,make.ilike.%${q}%,model.ilike.%${q}%`)
  }

  // Apply Pagination Range
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: vehicles, count, error } = await query
  const totalCount = count || 0

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Vehicles</h2>
        <Link 
          href="/vehicles/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Vehicle
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex justify-between items-center">
          <form className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search plate number, make, or model..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading vehicles: {error.message}
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Plate No</th>
                  <th className="px-6 py-3">Vehicle Details</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vehicles?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No vehicles found. {q && 'Try a different search.'}
                    </td>
                  </tr>
                ) : (
                  vehicles?.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <Link href={`/vehicles/${vehicle.id}`} className="font-bold text-blue-600 hover:underline uppercase">
                          {vehicle.plate_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Car size={16} className="text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                          </span>
                        </div>
                        {vehicle.transmission && (
                          <div className="text-xs text-slate-500 mt-1 ml-6">{vehicle.transmission}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.customers ? (
                          <div>
                            <Link href={`/customers/${vehicle.customers.id}`} className="font-medium text-slate-700 hover:text-blue-600 hover:underline flex items-center gap-2">
                              {vehicle.customers.customer_type === 'company' ? (
                                <Building2 size={16} className="text-slate-400" />
                              ) : (
                                <User size={16} className="text-slate-400" />
                              )}
                              {formatCustomerName(vehicle.customers)}
                            </Link>
                            <div className="text-xs text-slate-400 mt-1 ml-6 capitalize">
                              {vehicle.customers.customer_type}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No customer linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {format(new Date(vehicle.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {!error && totalCount > 0 && (
          <UrlPagination 
            totalCount={totalCount} 
            pageSize={pageSize} 
            currentPage={currentPage} 
          />
        )}
      </div>
    </div>
  )
}
