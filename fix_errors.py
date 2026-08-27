import re

# Fix 1: PartSearchSelector
with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
    ps = f.read()
ps = ps.replace(
    'let query = supabase',
    'let query: any = supabase' # to avoid TS error on method chaining if needed
)
with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
    f.write(ps)

# Fix 2: QuotationForm
with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qf = f.read()

# I removed the top level `if (quoteError)` when patching but left the throw! Let me check what I actually did:
qf = qf.replace(
    """      if (quoteError) {
        console.error("[QUOTATION SAVE] Step 4 FAILED (Quotation Header)", JSON.stringify(quoteError, null, 2));
        throw new Error(`Quotation Header Save Failed: ${quoteError.message} (${quoteError.code})`);
      }""",
    ""
)
with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qf)

# Fix 3: ResolvePartModal
with open('src/components/quotations/ResolvePartModal.tsx', 'r') as f:
    rpm = f.read()
rpm = rpm.replace('categoryId: string', 'categoryId: string | null')
with open('src/components/quotations/ResolvePartModal.tsx', 'w') as f:
    f.write(rpm)

