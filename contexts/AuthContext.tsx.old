// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setPermissions([]);
        setLoading(false);
      }
    });
    
    // Al cargar la app, obtener la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (!session) setLoading(false);
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) return; // Si no hay usuario, no hacer nada

      // 1. Obtener el rol_id del perfil del usuario
      const { data: profile } = await supabase
        .from('perfiles')
        .select('rol_id')
        .eq('id', user.id)
        .single();

      if (profile && profile.rol_id) {
        // 2. Con el rol_id, llamar a la función para obtener los nombres de los permisos
        const { data: perms } = await supabase
          .rpc('get_permissions_for_role', { p_rol_id: profile.rol_id });
        
        if (perms) {
          setPermissions(perms.map(p => p.nombre));
        }
      }
      setLoading(false);
    };

    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const value = { user, permissions, loading, hasPermission };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};