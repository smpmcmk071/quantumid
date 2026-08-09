import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function encryptValue(value, key) {
  if (value === null || value === undefined || value === '') return '';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(String(value));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').substring(0, 32)),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
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
    
    const fieldsToEncrypt = [
      'w2_wages', 'income_1099_misc', 'income_1099_nec', 'income_1099_int',
      'income_1099_div', 'total_income', 'adjusted_gross_income', 'deductions',
      'taxable_income', 'total_tax', 'federal_withheld', 'refund_amount', 'amount_owed'
    ];
    
    const encryptedTaxData = await Promise.all(
      taxData.map(async (yearData) => {
        const encrypted = { ...yearData };
        
        for (const field of fieldsToEncrypt) {
          if (yearData[field] !== null && yearData[field] !== undefined) {
            encrypted[field] = await encryptValue(yearData[field], encryptionKey);
          }
        }
        
        return encrypted;
      })
    );
    
    return Response.json({ success: true, encryptedTaxData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});