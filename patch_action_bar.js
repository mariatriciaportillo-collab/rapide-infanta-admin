const fs = require('fs');
const path = 'src/components/estimates/EstimateActionBar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import the new action and FileText
content = content.replace(
  /import \{ startJobEstimate \} from '@\/app\/\(dashboard\)\/estimates\/\[id\]\/actions'/,
  "import { startJobEstimate, createInvoiceFromEstimate } from '@/app/(dashboard)/estimates/[id]/actions'\nimport { FileText } from 'lucide-react'"
);

// Add state and handler
const createLogic = `
  const [isCompleting, setIsCompleting] = useState(false)
  
  const handleCompleteJob = async () => {
    if (!confirm('Complete this job?\\n\\nThis will mark the Estimate as completed and create the customer\\'s Invoice/Billing Statement. The Estimate will remain locked.')) {
      return
    }

    try {
      setIsCompleting(true)
      const res = await createInvoiceFromEstimate(estimateId)
      if (res.success && res.invoiceId) {
        router.push(\`/invoice/\${res.invoiceId}\`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsCompleting(false)
    }
  }
`;

content = content.replace(/  const handleApprove = async \(\) => \{/, createLogic + '\n  const handleApprove = async () => {');

// Update buttons
const buttonsRegex = /<button \n\s*onClick=\{handleApprove\}[\s\S]*?<\/button>/;
const newButtons = `<button 
        onClick={handleApprove}
        disabled={isApproving || isApproved}
        className={\`flex items-center justify-center px-4 py-2 transition border-r border-slate-200 font-medium text-sm gap-2
          \${isApproved ? 'bg-green-50 text-green-700 cursor-default' : 'hover:bg-slate-50 text-slate-700'}\`}
        title={isApproved ? "Job Started" : "Start Job"}
      >
        {isApproving ? <Loader2 size={16} className="animate-spin" /> : (isApproved ? <CheckCircle2 size={16} /> : <Check size={16} />)}
        <span className="hidden sm:inline">{isApproved ? 'Job Started' : 'Approve'}</span>
      </button>

      {/* Complete Job Button */}
      {(initialStatus === 'APPROVED' || initialStatus === 'JOB STARTED') && (
        <button 
          onClick={handleCompleteJob}
          disabled={isCompleting}
          className="flex items-center justify-center px-4 py-2 hover:bg-emerald-50 text-emerald-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          title="Complete Job"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span className="hidden sm:inline">Complete Job</span>
        </button>
      )}

      {/* View Invoice Button */}
      {initialStatus === 'COMPLETED' && (
        <button 
          onClick={handleCompleteJob} // It checks existing in action and returns invoiceId
          disabled={isCompleting}
          className="flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white transition border-r border-slate-200 font-medium text-sm gap-2"
          title="View Invoice"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          <span className="hidden sm:inline">View Invoice</span>
        </button>
      )}
      
      {initialStatus === 'COMPLETED' && (
        <div className="flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 font-medium text-sm gap-2">
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Completed</span>
        </div>
      )}`;

content = content.replace(buttonsRegex, newButtons);

fs.writeFileSync(path, content);
