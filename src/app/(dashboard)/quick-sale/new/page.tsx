import { QuickSaleForm } from '@/components/quick-sale/QuickSaleForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewQuickSalePage() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <Link href="/quick-sale" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Quick Sale</h1>
          <p className="text-slate-500">Create an over-the-counter transaction</p>
        </div>
      </div>
      <QuickSaleForm />
    </div>
  )
}
