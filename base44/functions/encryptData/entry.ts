import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { encrypt, decrypt } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, decrypt: shouldDecrypt } = await req.json();
    
    if (!data) {
      return Response.json({ error: 'Data required' }, { status: 400 });
    }

    if (shouldDecrypt) {
      const decrypted = await decrypt(data);
      return Response.json({
        success: true,
        decrypted
      });
    } else {
      const encrypted = await encrypt(data);
      return Response.json({
        success: true,
        encrypted
      });
    }

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});