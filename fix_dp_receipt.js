const fs = require('fs');

let path = 'src/app/(dashboard)/quotations/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// We need to add DP-xxxxx logic inside recordDownpayment
const regex = /const receiptNumber = `PAY-\$\{nextSeq\.toString\(\)\.padStart\(6, '0'\)\}`/;
const replacement = `const receiptNumber = \`PAY-\${nextSeq.toString().padStart(6, '0')}\`

  // Generate Customer Receipt (DP-xxxxx)
  let nextDpSeq = 1
  const { data: latestDp } = await supabase.from('payments').select('customer_receipt').ilike('customer_receipt', 'DP-%').order('customer_receipt', { ascending: false }).limit(1).maybeSingle()
  if (latestDp && latestDp.customer_receipt) {
    const match = latestDp.customer_receipt.match(/DP-(\\d+)/)
    if (match) nextDpSeq = parseInt(match[1]) + 1
  }
  const customerReceipt = \`DP-\${nextDpSeq.toString().padStart(5, '0')}\``;

content = content.replace(regex, replacement);

const insertRegex = /receipt_number: receiptNumber,/;
const insertReplacement = `receipt_number: receiptNumber,\n    customer_receipt: customerReceipt,`;

content = content.replace(insertRegex, insertReplacement);

fs.writeFileSync(path, content);
