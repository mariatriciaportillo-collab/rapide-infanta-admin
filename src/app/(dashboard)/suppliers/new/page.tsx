'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'

export default function AddSupplierPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobile, setMobile] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [tin, setTin] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name.trim()) {
      setError("Please enter a Supplier Name.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: name.trim(),
      contact_person: contactPerson.trim() || null,
      mobile: mobile.trim() || null,
      telephone: telephone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      tin: tin.trim() || null,
      payment_terms: paymentTerms.trim() || null,
      notes: notes.trim() || null,
      is_active: isActive
    }

    const { error: insertError } = await supabase
      .from('suppliers')
      .insert(payload)

    if (insertError) {
      setError(`Failed to save supplier: ${insertError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/suppliers')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/suppliers" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Add Supplier</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">COMPANY INFORMATION</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 font-medium" 
                placeholder="e.g. ABC Auto Parts" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
              <input 
                type="text" 
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="e.g. Juan Dela Cruz" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TIN</label>
              <input 
                type="text" 
                value={tin}
                onChange={e => setTin(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="000-000-000-000" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">CONTACT DETAILS</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
              <input 
                type="text" 
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="0917-000-0000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
              <input 
                type="text" 
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="(02) 8000-0000" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="sales@abcautoparts.com" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea 
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="Complete address..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
              <input 
                type="text" 
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="e.g. 30 Days, COD" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="Optional internal notes..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full border border-slate-300 rounded-md p-2 bg-white max-w-xs"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/suppliers"
            className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Supplier'}
          </button>
        </div>
      </form>
    </div>
  )
}
