import re

def patch():
    with open('src/app/(dashboard)/purchase-orders/[id]/receive/ReceiveItemsClient.tsx', 'r') as f:
        code = f.read()

    old_payload = """    const { data, error: rpcError } = await supabase.rpc('receive_po_items', {
      p_po_id: id,
      p_receive_date: receiveDate,
      p_supplier_ref: supplierRef,
      p_notes: notes,
      p_items: rpcItems,
      p_user_id: userId
    })"""

    new_payload = """    const payload: any = {
      p_po_id: id,
      p_receive_date: receiveDate,
      p_items: rpcItems
    }
    if (supplierRef) payload.p_supplier_ref = supplierRef
    if (notes) payload.p_notes = notes
    if (userId) payload.p_user_id = userId

    const { data, error: rpcError } = await supabase.rpc('receive_po_items', payload)"""

    code = code.replace(old_payload, new_payload)

    with open('src/app/(dashboard)/purchase-orders/[id]/receive/ReceiveItemsClient.tsx', 'w') as f:
        f.write(code)

patch()
