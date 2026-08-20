import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/[id]/OutsidePurchaseDetailClient.tsx', 'r') as f:
        code = f.read()

    # Fix fetching logic
    old_fetch = """    // Fetch outside purchase
    const { data: opData } = await supabase
      .from('outside_purchases')
      .select('*, suppliers(name), profiles:created_by(email)')
      .eq('id', id)
      .single()"""
      
    new_fetch = """    // Fetch outside purchase
    const { data: opData } = await supabase
      .from('outside_purchases')
      .select('*, suppliers(name)')
      .eq('id', id)
      .single()"""
    code = code.replace(old_fetch, new_fetch)

    # Fix display logic
    old_created = "<div className=\"font-medium text-slate-800\">{purchase.profiles?.email || 'Unknown User'}</div>"
    new_created = "<div className=\"font-medium text-slate-800 text-sm\">{purchase.created_by || 'Unknown'}</div>"
    code = code.replace(old_created, new_created)

    with open('src/app/(dashboard)/outside-purchases/[id]/OutsidePurchaseDetailClient.tsx', 'w') as f:
        f.write(code)

patch()
