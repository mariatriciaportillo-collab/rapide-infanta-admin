import Link from 'next/link'
import { Plus, Search, Building2, User, Phone, Car } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { UrlPagination } from '@/components/ui/UrlPagination'

function formatCustomerName(customer: any) {
  if (customer.customer_type === 'company' && customer.name) {
    return customer.name
  }
  const parts = [customer.first_name, customer.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Customer'
}

function formatContactPerson(customer: any) {
  const parts = [customer.contact_first_name, customer.contact_last_name].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return customer.contact_person || ''
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const q = params.q
  
  const currentPage = parseInt(params.page || '1', 10)
  const pageSize = 10

  let query = supabase
    .from('customers')
    .select('*, vehicles(id, plate_number)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) {
    const cleanQ = q.replace(/[\s-]/g, '').toLowerCase()
    let matchingCustomerIds = new Set<string>()

    // 1. Search text fields in customers
    const { data: textMatches } = await supabase
      .from('customers')
      .select('id')
      .or(`name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,contact_person.ilike.%${q}%,contact_first_name.ilike.%${q}%,contact_last_name.ilike.%${q}%,mobile.ilike.%${q}%,tin.ilike.%${q}%`)

    if (textMatches) {
      textMatches.forEach(m => matchingCustomerIds.add(m.id))
    }

    // 2. Search all vehicles to allow normalized forgiving match
    const { data: allVehicles } = await supabase
      .from('vehicles')
      .select('customer_id, plate_number')
      
    if (allVehicles) {
      allVehicles.forEach(v => {
        const normPlate = (v.plate_number || '').replace(/[\s-]/g, '').toLowerCase()
        if (normPlate.includes(cleanQ)) {
          if (v.customer_id) matchingCustomerIds.add(v.customer_id)
        }
      })
    }

    // 3. Apply the filter to the main query
    if (matchingCustomerIds.size > 0) {
      query = query.in('id', Array.from(matchingCustomerIds))
    } else {
      // Force empty result if search had no matches
      query = query.eq('id', '00000000-0000-0000-0000-000000000000') 
    }
  }

  // Apply Pagination Range
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: customers, count, error } = await query

  const totalCount = count || 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        <Link 
          href="/customers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <form className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search customer, company, mobile, or plate number..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading customers: {error.message}
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer / Company</th>
                  <th className="px-4 py-3 font-semibold">Plate Number</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Vehicles</th>
                  <th className="px-4 py-3 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                    
                    // Sort vehicles for consistent display
                    const vehicles = customer.vehicles || []
                    const vehicleCount = vehicles.length
                    const displayVehicles = vehicles.slice(0, 2)
                    const hiddenCount = vehicleCount > 2 ? vehicleCount - 2 : 0

                    return (
                      <tr key={customer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-2">
                            {customer.customer_type === 'company' ? (
                              <Building2 size={16} className="text-slate-400" />
                            ) : (
                              <User size={16} className="text-slate-400" />
                            )}
                            {displayName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {vehicleCount === 0 ? (
                            <span className="text-slate-400 italic">No vehicle</span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                              {displayVehicles.map((v: any, idx: number) => (
                                <Link 
                                  key={v.id} 
                                  href={`/vehicles/${v.id}`}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition border border-slate-200"
                                >
                                  {v.plate_number}
                                </Link>
                              ))}
                              {hiddenCount > 0 && (
                                <Link
                                  href={`/customers/${customer.id}`}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 border-dashed"
                                  title={`View all ${vehicleCount} vehicles`}
                                >
                                  +{hiddenCount} more
                                </Link>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Car size={16} className="text-slate-400" />
                            {vehicleCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {format(new Date(customer.created_at), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    )
                  })
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
