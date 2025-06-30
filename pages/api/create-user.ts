// pages/api/create-user.ts (Versión corregida)
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { email, password, rol_id } = req.body;
  if (!email || !password || !rol_id) {
    return res.status(400).json({ error: 'Email, password, and rol_id are required' });
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !user) {
      throw authError || new Error('No se pudo crear el usuario en Auth.');
    }

    // ----- LÍNEA MODIFICADA -----
    // Cambiamos .insert() por .upsert() para manejar perfiles que ya existen.
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .upsert({ id: user.id, rol_id: rol_id }); 
    // ----- FIN DE LA MODIFICACIÓN -----

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    res.status(200).json({ message: 'User created successfully', user });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}