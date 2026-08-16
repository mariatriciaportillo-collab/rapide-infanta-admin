'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Building2, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()
  const { id } = use(params)
  
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual')
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobile, setMobile] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [tin, setTin] = useState('')
  const [notes, setNotes] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomer() {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
      if (error) {
        setError('Could not load customer.')
        setIsLoading(false)
        return
      }
      
      setCustomerType(data.customer_type as 'individual' | 'company' || 'individual')
      setName(data.name || '')
      setContactPerson(data.contact_person || '')
      setMobile(data.mobile || '')
      setTelephone(data.telephone || '')
      setEmail(data.email || '')
      setAddress(data.address || '')
      setTin(data.tin || '')
      setNotes(data.notes || '')
      setIsLoading(false)
    }
    loadCustomer()
  }, [id, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name.trim()) {
      setError(customerType === 'individual' ? "Full Name is required." : "Company Name is required.")
      setIsSubmitting(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          customer_type: customerType,
          name: name,
          contact_person: customerType === 'company' ? contactPerson : null,
          mobile: mobile,
          telephone: customerType === 'company' ? telephone : null,
          email: email,
          address: address,
          tin: customerType === 'company' ? tin : null,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push(`/customers/${id}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while saving.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading customer data...</div>

  return (
    <form onSubmit={handleSave} className="pb-24 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/customers/${id}`} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Edit Customer</h2>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6 flex gap-4">
          <button
            type="button"
            onClick={() => setCustomerType('individual')}
            className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition
              ${customerType === 'individual' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            <UserIcon size={20} />
            Individual
          </button>
          <button
            type="button"
            onClick={() => setCustomerType('company')}
            className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition
              ${customerType === 'company' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            <Building2 size={20} />
            Company
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {customerType === 'individual' ? 'Full Name *' : 'Company Name *'}
            </label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder={customerType === 'individual' ? 'Juan Dela Cruz' : 'ABC Construction Corporation'} />
          </div>
          
          {customerType === 'company' && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
              <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Maria Santos" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="09171234567" />
          </div>

          {customerType === 'company' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone Number</label>
              <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="042-123-4567" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="juan@example.com" />
            </div>
          )}

          {customerType === 'company' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="info@abccompany.com" />
            </div>
          )}

          {customerType === 'company' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TIN</label>
              <input type="text" value={tin} onChange={e => setTin(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123-456-789-000" />
            </div>
          )}

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="123 Main St, Infanta, Quezon" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full border border-slate-300 rounded-md p-2" placeholder="Any additional information..."></textarea>
          </div>
        </div>
      </div>
    </form>
  )
}
