import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Crear un cliente de Supabase con privilegios de administrador en el servidor
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    // 2. Obtener la lista de usuarios del sistema de Autenticación
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError || !usersData) {
      throw usersError || new Error('No se pudieron obtener los usuarios.');
    }
    const { users } = usersData;

    // 3. Obtener los perfiles y roles asociados
    const { data: perfiles, error: perfilesError } = await supabaseAdmin
      .from('perfiles')
      .select('id, rol_id, roles(nombre)');
    if (perfilesError) {
      throw perfilesError;
    }

    // 4. Combinar la información
    const perfilesMap = new Map((perfiles || []).map(p => [p.id, p]));
    const combinedData = users.map(user => ({
      id: user.id,
      email: user.email || 'N/A',
      rol_id: perfilesMap.get(user.id)?.rol_id || null,
      roles: perfilesMap.get(user.id)?.roles || null,
    }));

    // 5. Enviar la respuesta exitosa
    res.status(200).json(combinedData);
    
  } catch (error: any) {
    // 6. Manejar cualquier error que ocurra en el proceso
    res.status(500).json({ error: error.message });
  }
}