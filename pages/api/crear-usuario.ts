// pages/api/create-user.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { email, password, rol_id } = req.body;
  if (!email || !password || !rol_id) {
    return res.status(400).json({ error: 'Email, password, and rol_id are required' });
  }

  // 1. Crear usuario en Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError) return res.status(500).json({ error: authError.message });

  // 2. Crear perfil en la tabla public.perfiles
  const { error: profileError } = await supabaseAdmin
    .from('perfiles').insert({ id: user.id, rol_id: rol_id });
  if (profileError) return res.status(500).json({ error: profileError.message });

  res.status(200).json({ message: 'User created successfully', user });
}