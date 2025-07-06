// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    permissions: Set<string>;
    loading: boolean;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            
            if (session?.user) {
                // Paso 1: Obtenemos el perfil del usuario para saber su rol_id
                const { data: userProfile, error: profileError } = await supabase
                    .from('perfiles')
                    .select('rol_id')
                    .eq('id', session.user.id)
                    .single();

                // IMPRIMIMOS EN CONSOLA LO QUE OBTENEMOS
                console.log("PERFIL OBTENIDO DE SUPABASE:", userProfile);
                if (profileError) console.error("ERROR AL OBTENER PERFIL:", profileError);

                setProfile(userProfile);

                // Paso 2: Si obtuvimos un perfil con un rol_id, buscamos los permisos para ESE rol
                if (userProfile?.rol_id) {
                    const { data: userPermissions, error: permissionsError } = await supabase
                        .from('rol_permisos')
                        .select('permiso')
                        .eq('rol_id', userProfile.rol_id);

                    // IMPRIMIMOS EN CONSOLA LOS PERMISOS
                    console.log(`PERMISOS OBTENIDOS PARA EL ROL ID ${userProfile.rol_id}:`, userPermissions);
                    if (permissionsError) console.error("ERROR AL OBTENER PERMISOS:", permissionsError);
                    
                    setPermissions(new Set(userPermissions?.map(p => p.permiso) || []));
                }
            }
            setLoading(false);
        };

        getSessionAndProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            // Cuando el estado de auth cambia (login/logout), volvemos a buscar todo
            setUser(session?.user ?? null);
            getSessionAndProfile();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    const hasPermission = (permission: string) => {
        // Para depurar, imprimimos qué permiso se está comprobando
        console.log(`Comprobando permiso: '${permission}'... Resultado: ${permissions.has(permission)}`);
        return permissions.has(permission);
    }

    const value = { user, profile, permissions, loading, hasPermission };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};