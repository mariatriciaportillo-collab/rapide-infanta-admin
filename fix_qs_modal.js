const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('showPaymentModal')) {
  // Add state and icons
  content = content.replace(
    /const \[loading, setLoading\] = useState\(true\)/,
    "const [loading, setLoading] = useState(true)\n  const [showPaymentModal, setShowPaymentModal] = useState(false)\n  const [payAmount, setPayAmount] = useState('')\n  const [payMethod, setPayMethod] = useState('CASH')\n  const [payRef, setPayRef] = useState('N/A')\n  const [isSubmitting, setIsSubmitting] = useState(false)"
  );

  content = content.replace(
    /import \{ ArrowLeft,.*?\} from 'lucide-react'/,
    "import { ArrowLeft, Printer, FileText, CheckCircle, Edit, Building2, User as UserIcon, Car, ArrowRightCircle, DollarSign, X } from 'lucide-react'"
  );

  // Add handleRecordPayment
  const handleRecordPayment = `
  const handleRecordPayment = async () => {
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return alert('Invalid amount')
    if (amount > Number(sale.balance_due)) return alert('Cannot overpay')
    
    setIsSubmitting(true)
    
    // Create Payment
    const { data: latest } = await supabase.from('payments').select('receipt_number').ilike('receipt_number', 'PAY-%').order('receipt_number', { ascending: false }).limit(1).single()
    let nextSeq = 1
    if (latest && latest.receipt_number) {
      const match = latest.receipt_number.match(/PAY-(\\d+)/)
      if (match) nextSeq = parseInt(match[1]) + 1
    }
    const receiptNumber = \`PAY-\${nextSeq.toString().padStart(6, '0')}\`

    const { data: { user } } = await supabase.auth.getUser()
    const receivedBy = user?.user_metadata?.first_name 
      ? \`\${user.user_metadata.first_name} \${user.user_metadata.last_name}\`.trim()
      : user?.email?.split('@')[0] || 'Unknown User'

    const { data: payment, error: payErr } = await supabase.from('payments').insert({
      receipt_number: receiptNumber,
      quick_sale_id: sale.id,
      customer_id: sale.customer_id,
      amount_paid: amount,
      payment_method: payMethod,
      reference_number: payRef,
      received_by: receivedBy
    }).select().single()

    if (payErr) { alert(payErr.message); setIsSubmitting(false); return; }

    // Update Quick Sale
    const newAmountPaid = Number(sale.amount_paid || 0) + amount
    const newBalanceDue = Number(sale.grand_total) - newAmountPaid
    let newStatus = 'UNPAID'
    if (newBalanceDue <= 0) newStatus = 'PAID'
    else if (newAmountPaid > 0) newStatus = 'PARTIALLY PAID'

    await supabase.from('quick_sales').update({
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus
    }).eq('id', sale.id)

    setShowPaymentModal(false)
    window.location.reload()
  }
`;

  content = content.replace(/  return \(/, handleRecordPayment + '\n  return (');

  // Add Button
  const buttonStr = `
          {sale.status === 'DRAFT' && (
            <button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <ArrowRightCircle size={16} /> Push to Payments
            </button>
          )}
          
          {(sale.status === 'UNPAID' || sale.status === 'PARTIALLY PAID') && (
            <button onClick={() => { setPayAmount(sale.balance_due); setShowPaymentModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <DollarSign size={16} /> Record Payment
            </button>
          )}
`;
  content = content.replace(/          \{sale\.status === 'DRAFT' && \([\s\S]*?<\/button>\n          \)\}/, buttonStr);

  // Add Totals for Paid/Balance
  const totalsStr = `
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex justify-between items-end text-slate-900 font-bold mb-2">
            <span className="text-sm uppercase tracking-wider">Grand Total</span>
            <span className="text-lg">₱{Number(sale.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between items-end text-emerald-700 font-bold mb-2">
            <span className="text-sm uppercase tracking-wider">Total Paid</span>
            <span className="text-lg">₱{Number(sale.amount_paid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="border-t border-slate-300 pt-3 flex justify-between items-end text-red-600 font-bold">
            <span className="text-sm uppercase tracking-wider">Balance Due</span>
            <span className="text-2xl tracking-tight">₱{Number(sale.balance_due ?? sale.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
`;
  content = content.replace(
    /          <div className="h-px bg-slate-200 my-1"><\/div>\n          <div className="flex justify-between items-end text-slate-900 font-bold">\n            <span className="text-sm uppercase tracking-wider">Grand Total<\/span>\n            <span className="text-2xl text-blue-600 tracking-tight">₱\{Number\(sale\.grand_total\)\.toLocaleString\('en-US', \{minimumFractionDigits: 2\}\)\}<\/span>\n          <\/div>/,
    totalsStr
  );

  // Add modal JSX at the very end
  const modalStr = `
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4 border border-blue-100 flex justify-between">
                <span className="font-medium">Remaining Balance:</span>
                <span className="font-bold">₱{Number(sale.balance_due ?? sale.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay (₱)</label>
                <input 
                  type="number" 
                  min="0.01" 
                  max={Number(sale.balance_due ?? sale.grand_total)}
                  step="0.01" 
                  value={payAmount} 
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                <select 
                  value={payMethod} 
                  onChange={e => { setPayMethod(e.target.value); if(e.target.value==='CASH') setPayRef('N/A'); else setPayRef(''); }}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="GCASH">GCash</option>
                  <option value="MAYA">Maya</option>
                  <option value="BANK TRANSFER">Bank Transfer</option>
                  <option value="DEBIT CARD">Debit Card</option>
                  <option value="CREDIT CARD">Credit Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reference Number</label>
                <input 
                  type="text" 
                  value={payRef} 
                  onChange={e => setPayRef(e.target.value)}
                  disabled={payMethod === 'CASH'}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder={payMethod === 'CASH' ? 'N/A' : 'Transaction ID, Check No., etc.'}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isSubmitting || !payAmount || Number(payAmount) <= 0 || Number(payAmount) > Number(sale.balance_due ?? sale.grand_total) || (payMethod !== 'CASH' && !payRef.trim())}
                onClick={handleRecordPayment}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
`;
  content = content.replace(/    <\/div>\n  \)\n\}\n$/, modalStr + '    </div>\n  )\n}\n');

  fs.writeFileSync(path, content);
}
