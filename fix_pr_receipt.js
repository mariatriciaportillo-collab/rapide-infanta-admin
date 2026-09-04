const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  const regex = /const receiptNumber = `PAY-\$\{nextSeq\.toString\(\)\.padStart\(6, '0'\)\}`/;
  const replacement = `const receiptNumber = \`PAY-\${nextSeq.toString().padStart(6, '0')}\`

    // Generate Customer Receipt (PR-xxxxx)
    let nextPrSeq = 1
    const { data: latestPr } = await supabase.from('payments').select('customer_receipt').ilike('customer_receipt', 'PR-%').order('customer_receipt', { ascending: false }).limit(1).single()
    if (latestPr && latestPr.customer_receipt) {
      const match = latestPr.customer_receipt.match(/PR-(\\d+)/)
      if (match) nextPrSeq = parseInt(match[1]) + 1
    }
    const customerReceipt = \`PR-\${nextPrSeq.toString().padStart(5, '0')}\``;

  content = content.replace(regex, replacement);

  const insertRegex = /receipt_number: receiptNumber,/;
  const insertReplacement = `receipt_number: receiptNumber,\n      customer_receipt: customerReceipt,`;

  content = content.replace(insertRegex, insertReplacement);

  fs.writeFileSync(path, content);
  console.log("Updated", path);
}

processFile('src/app/(dashboard)/invoice/[id]/page.tsx');
processFile('src/app/(dashboard)/quick-sale/[id]/page.tsx');

