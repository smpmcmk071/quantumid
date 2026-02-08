import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function decryptValue(encryptedValue, key) {
  if (!encryptedValue || encryptedValue === '') return null;
  
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key.padEnd(32, '0').substring(0, 32)),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    const decryptedValue = decoder.decode(decrypted);
    return parseFloat(decryptedValue);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { taxData } = await req.json();
    
    if (!taxData || !Array.isArray(taxData)) {
      return Response.json({ error: 'Invalid tax data' }, { status: 400 });
    }
    
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      return Response.json({ error: 'Encryption key not configured' }, { status: 500 });
    }
    
    const fieldsToDecrypt = [
      'w2_wages', 'income_1099_misc', 'income_1099_nec', 'income_1099_int',
      'income_1099_div', 'total_income', 'adjusted_gross_income', 'deductions',
      'taxable_income', 'total_tax', 'federal_withheld', 'refund_amount', 'amount_owed'
    ];
    
    const decryptedTaxData = await Promise.all(
      taxData.map(async (yearData) => {
        const decrypted = { ...yearData };
        
        for (const field of fieldsToDecrypt) {
          if (yearData[field]) {
            decrypted[field] = await decryptValue(yearData[field], encryptionKey);
          }
        }
        
        return decrypted;
      })
    );
    
    return Response.json({ success: true, decryptedTaxData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});