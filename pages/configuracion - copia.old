// pages/configuracion.tsx (Versión Definitiva)
'use client';
import { useEffect, useState, FormEvent, FC } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

// --- Interfaces ---
interface PerfilAdmin {
  id: string;
  email: string;
  rol_id: number | null;
  roles: { nombre: string; } | null;
}
interface Rol {
  id: number;
  nombre: string;
}

// --- Componente Modal ---
const CreateUserModal: FC<{ isOpen: boolean; onClose: () => void; onUserCreated: () => void; roles: Rol[] }> = ({ isOpen, onClose, onUserCreated, roles }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol_id, setRolId] = useState<number>(roles[0]?.id || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rol_id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Algo salió mal');
      toast.success('Usuario creado con éxito!');
      onUserCreated();
      onClose();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">Contraseña Temporal</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="role">Rol Inicial</label>
            <select id="role" value={rol_id} onChange={e => setRolId(Number(e.target.value))} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
              {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function AdminPage() {
  const { hasPermission, loading: authLoading } = useAuth();
  const [perfiles, setPerfiles] = useState<PerfilAdmin[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch('/api/list-users');
      if (!response.ok) throw new Error('No se pudo cargar la lista de usuarios');
      const data = await response.json();
      setPerfiles(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && hasPermission('view_administracion')) {
      fetchData();
      supabase.from('roles').select('*').then(({ data }) => setRoles(data || []));
    }
  }, [authLoading, hasPermission]);

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    const { error } = await supabase.from('perfiles').update({ rol_id: newRoleId }).eq('id', userId);
    if (error) {
      toast.error("Error al cambiar el rol.");
    } else {
      toast.success("Rol actualizado con éxito.");
      fetchData(); // Recargar todos los datos para asegurar consistencia
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userEmail}? Esta acción es irreversible.`)) {
      try {
        const response = await fetch('/api/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast.success(`Usuario ${userEmail} eliminado con éxito.`);
        setPerfiles(perfiles.filter(p => p.id !== userId));
      } catch (error: any) {
        toast.error(`Error al eliminar: ${error.message}`);
      }
    }
  };

  if (authLoading) return <div className="text-white">Cargando...</div>;
  if (!hasPermission('view_administracion')) return <div className="text-white">No tienes permiso para ver esta página.</div>;

  return (
    <>
      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUserCreated={fetchData} roles={roles} />
      <div className="text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Administración de Usuarios</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Crear Usuario
          </button>
        </div>
        {isDataLoading ? <div className="text-center p-8">Cargando usuarios...</div> : (
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-2">Usuario (Email)</th>
                  <th className="p-2">Rol Actual</th>
                  <th className="p-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {perfiles.map(perfil => (
                  <tr key={perfil.id} className="border-b border-white/10">
                    <td className="p-2">{perfil.email}</td>
                    <td className="p-2">
                      <select
                        value={perfil.rol_id || ''}
                        onChange={(e) => handleRoleChange(perfil.id, Number(e.target.value))}
                        className="p-2 rounded bg-white text-gray-800 border border-gray-300"
                        disabled={!perfil.rol_id}
                      >
                        {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                      </select>
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => handleDeleteUser(perfil.id, perfil.email)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}