import re

def patch():
    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'r') as f:
        code = f.read()

    old_payload = """    const payload: any = {
      p_supplier_id: supplierId,
      p_order_date: orderDate,
      p_items: rpcItems
    }
    if (expectedDate) payload.p_expected_date = expectedDate
    if (reference) payload.p_reference = reference
    if (notes) payload.p_notes = notes
    if (terms) payload.p_terms = terms
    if (userId) payload.p_user_id = userId

    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', payload)"""

    new_payload = """    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', {
      p_supplier_id: supplierId || null,
      p_order_date: orderDate || null,
      p_expected_date: expectedDate || null,
      p_reference: reference || null,
      p_terms: terms || null,
      p_notes: notes || null,
      p_items: rpcItems,
      p_user_id: userId || null
    })"""

    code = code.replace(old_payload, new_payload)

    with open('src/app/(dashboard)/purchase-orders/new/page.tsx', 'w') as f:
        f.write(code)

patch()
