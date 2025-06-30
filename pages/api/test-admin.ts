// pages/api/test-admin.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("--- EJECUTANDO API DE PRUEBA: /api/test-admin ---");

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // La única acción: intentar listar usuarios con la clave de admin.
  // Esto no toca tus tablas, solo el sistema de autenticación de Supabase.
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error en la API de prueba:", error);
    return res.status(500).json({ test_error: error.message });
  }

  console.log("Éxito en la API de prueba. Número de usuarios:", data.users.length);
  res.status(200).json({ success: true, user_count: data.users.length });
}