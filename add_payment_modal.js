const fs = require('fs');
const path = 'src/components/quotations/QuotationActionBar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
  /import \{ approveQuotationWithConditions, createEstimateFromQuotation \} from '@\/app\/\(dashboard\)\/quotations\/\[id\]\/actions'/,
  "import { approveQuotationWithConditions, createEstimateFromQuotation, recordDownpayment } from '@/app/(dashboard)/quotations/[id]/actions'"
);

// Add payment state
content = content.replace(
  /const \[isCreatingEstimate, setIsCreatingEstimate\] = useState\(false\)/,
  "const [isCreatingEstimate, setIsCreatingEstimate] = useState(false)\n  \n  const [showPaymentModal, setShowPaymentModal] = useState(false)\n  const [payAmount, setPayAmount] = useState('')\n  const [payMethod, setPayMethod] = useState('CASH')\n  const [payRef, setPayRef] = useState('N/A')\n  const [isPaying, setIsPaying] = useState(false)"
);

// Add payment function
const payFunc = `
  const handlePayment = async () => {
    const amt = parseFloat(payAmount)
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount."); return;
    }
    
    try {
      setIsPaying(true)
      const res = await recordDownpayment(quote.id, amt, payMethod, payRef)
      if (res.success) {
        setShowPaymentModal(false)
        setPayAmount('')
        router.refresh()
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsPaying(false)
    }
  }
`;
content = content.replace(
  /const handleCreateEstimate = async \(\) => \{/,
  payFunc + "\n  const handleCreateEstimate = async () => {"
);

// Update Collect Downpayment button
content = content.replace(
  /onClick=\{.*?router\.push\(\`\/payments\/new.*?\}.*?/,
  "onClick={() => setShowPaymentModal(true)}"
);

// Add Payment Modal JSX
const paymentModal = `
      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Collect Downpayment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Required Downpayment:</span>
                  <span className="font-bold">₱{Number(quote.required_downpayment_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span className="font-bold text-emerald-600">₱{Number(quote.downpayment_paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200 mt-1">
                  <span className="font-bold">Remaining to Pay:</span>
                  <span className="font-bold">₱{Number(Math.max(0, (quote.required_downpayment_amount || 0) - (quote.downpayment_paid_amount || 0))).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay (₱)</label>
                <input 
                  type="number" 
                  min="0.01" 
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
              
              {payMethod !== 'CASH' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reference Number</label>
                  <input 
                    type="text" 
                    value={payRef} 
                    onChange={e => setPayRef(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 000123456"
                  />
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition">
                Cancel
              </button>
              <button 
                onClick={handlePayment} 
                disabled={isPaying || !payAmount || (payMethod !== 'CASH' && !payRef)}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
              >
                {isPaying && <Loader2 size={16} className="animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
`;
content = content.replace(
  /\{\/\* APPROVAL MODAL \*\/\}/,
  paymentModal + "\n\n      {/* APPROVAL MODAL */}"
);

fs.writeFileSync(path, content);
