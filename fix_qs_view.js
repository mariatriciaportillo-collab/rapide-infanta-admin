const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/sale\.status === 'COMPLETED'/g, "sale.status === 'UNPAID' || sale.status === 'PAID'");
content = content.replace(/status: 'COMPLETED'/g, "status: 'UNPAID', inventory_deducted: true");

const invLogic = `
  const handleComplete = async () => {
    if (!confirm('Complete this Quick Sale and Push to Payments? This will deduct inventory and lock the record.')) return;
    
    if (!sale.inventory_deducted) {
      for (const item of sale.quick_sale_items) {
        if (item.part_id) {
          const { data: currentPart } = await supabase.from('parts_inventory').select('stock_quantity').eq('id', item.part_id).single()
          if (currentPart) {
            await supabase.from('parts_inventory').update({ stock_quantity: Number(currentPart.stock_quantity) - Number(item.quantity) }).eq('id', item.part_id)
          }
        }
      }
    }

    await supabase.from('quick_sales').update({ status: 'UNPAID', inventory_deducted: true }).eq('id', id)
    window.location.reload()
  }
`;

content = content.replace(/  const handleComplete = async \(\) => \{[\s\S]*?window\.location\.reload\(\)\n  \}/, invLogic.trim());

content = content.replace(/Complete Sale<\/button>/, "Push to Payments</button>");
content = content.replace(/<CheckCircle size=\{16\} \/>/, "<ArrowRightCircle size={16} />");
content = content.replace(/CheckCircle,/, "CheckCircle, ArrowRightCircle,");

fs.writeFileSync(path, content);
