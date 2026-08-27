import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [error, setError] = useState<string | null>(null)", "const [error, setError] = useState<string | null>(null)\n  const isEditingQuote = !!initialData\n")

save_old = """      // 1. Generate Quote Number
      let nextNumber = 1;
      const { data: latestQuote } = await supabase
        .from('quotations')
        .select('quote_number')
        .ilike('quote_number', 'INF-%')
        .order('quote_number', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (latestQuote && latestQuote.quote_number) {
        const match = latestQuote.quote_number.match(/INF-(\\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      const quoteNumber = `INF-${nextNumber.toString().padStart(5, '0')}`;
      console.log("[QUOTATION SAVE] Step 4: Creating quotation header...");
      const quotePayload = {
          quote_number: quoteNumber,
          customer_id: finalCustomerId,
          vehicle_id: finalVehicleId,
          // Snapshots (combined formatted names to keep quotation table simple)
          customer_type: customerType,
          customer_name: finalDisplayName, 
          contact_person: customerType === 'company' ? finalContactPerson : null,
          customer_email: customerEmail,
          customer_telephone: customerType === 'company' ? (customerMobile || customerTelephone) : customerMobile,
          customer_tin: customerType === 'company' ? customerTin : null,
          customer_address: customerAddress,
          vehicle_plate: vehiclePlate.toUpperCase(), 
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
          mileage_km: mileage ? parseFloat(mileage) : null,
          status: 'draft',
          prepared_by: preparedBy,
          notes: notes,
          warranty_terms: warranty,
          subtotal: subtotal,
          discount_amount: Number(discount) || 0,
          grand_total: grandTotal
      };

      // 2. Insert Quotation
      const { data: quote, error: quoteError } = await supabase
        .from('quotations')
        .insert(quotePayload)
        .select()
        .single()"""

save_new = """      // 1. Generate Quote Number (only if new)
      let quoteNumber = initialData?.quote_number;
      if (!isEditingQuote) {
        let nextNumber = 1;
        const { data: latestQuote } = await supabase
          .from('quotations')
          .select('quote_number')
          .ilike('quote_number', 'INF-%')
          .order('quote_number', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (latestQuote && latestQuote.quote_number) {
          const match = latestQuote.quote_number.match(/INF-(\\d+)/);
          if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        quoteNumber = `INF-${nextNumber.toString().padStart(5, '0')}`;
      }
      
      console.log("[QUOTATION SAVE] Step 4: Saving quotation header...");
      const quotePayload = {
          quote_number: quoteNumber,
          customer_id: finalCustomerId,
          vehicle_id: finalVehicleId,
          customer_type: customerType,
          customer_name: finalDisplayName, 
          contact_person: customerType === 'company' ? finalContactPerson : null,
          customer_email: customerEmail,
          customer_telephone: customerType === 'company' ? (customerMobile || customerTelephone) : customerMobile,
          customer_tin: customerType === 'company' ? customerTin : null,
          customer_address: customerAddress,
          vehicle_plate: vehiclePlate.toUpperCase(), 
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
          mileage_km: mileage ? parseFloat(mileage) : null,
          status: initialData?.status || 'draft',
          prepared_by: preparedBy,
          notes: notes,
          warranty_terms: warranty,
          subtotal: subtotal,
          discount_amount: Number(discount) || 0,
          grand_total: grandTotal
      };

      // 2. Save Quotation
      let quote = null;
      if (isEditingQuote) {
        const { data: updatedQuote, error: quoteError } = await supabase
          .from('quotations')
          .update(quotePayload)
          .eq('id', initialData.id)
          .select()
          .single()
        
        if (quoteError) throw new Error(`Quotation Header Update Failed: ${quoteError.message}`);
        quote = updatedQuote;
        
        // Delete old items so we can insert cleanly
        await supabase.from('quotation_items').delete().eq('quotation_id', quote.id)
      } else {
        const { data: newQuote, error: quoteError } = await supabase
          .from('quotations')
          .insert(quotePayload)
          .select()
          .single()
          
        if (quoteError) throw new Error(`Quotation Header Save Failed: ${quoteError.message}`);
        quote = newQuote;
      }"""
      
content = content.replace(save_old, save_new)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
