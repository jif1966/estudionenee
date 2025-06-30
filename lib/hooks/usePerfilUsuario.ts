/*
  Archivo: /lib/hooks/usePerfilUsuario.ts
  Hook para obtener el perfil del usuario logueado (nombre, rol, activo)
  También devuelve el objeto user completo desde Supabase Auth.
*/

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type PerfilUsuario = {
  id: string;
  nombre: string;
  rol: 'admin' | 'operador';
  activo: boolean;
};

export function usePerfilUsuario() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerPerfil = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPerfil(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setPerfil({
          id: user.id,
          nombre: data.nombre,
          rol: data.rol,
          activo: data.activo,
        });
      } else {
        setPerfil(null);
      }
      setLoading(false);
    };

    obtenerPerfil();
  }, []);

  return { perfil, user, loading };
}
