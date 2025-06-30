/*
  Archivo: /pages/admin/usuarios.tsx
  Gestión completa de usuarios desde la web:
  - Crear usuario (correo, contraseña, nombre, rol)
  - Listar usuarios y sus roles
  - Editar rol o estado (activo/inactivo)
*/

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export default function UsuariosPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('operador');
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const cargarUsuarios = async () => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, activo, creado_en');

    if (!error && data) setUsuarios(data);
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      alert('Error creando usuario: ' + authError.message);
      return;
    }

    await supabase.from('perfiles').insert({
      id: data.user?.id,
      nombre,
      rol,
      activo: true,
    });

    setEmail('');
    setPassword('');
    setNombre('');
    setRol('operador');
    cargarUsuarios();
  };

  const actualizarPerfil = async (id: string, campo: string, valor: any) => {
    const { error } = await supabase.from('perfiles').update({ [campo]: valor }).eq('id', id);
    if (!error) cargarUsuarios();
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>

      <form onSubmit={crearUsuario} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <h2 className="font-semibold">Crear nuevo usuario</h2>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <select value={rol} onChange={(e) => setRol(e.target.value)} className="border rounded px-3 py-2">
          <option value="operador">Operador</option>
          <option value="admin">Administrador</option>
        </select>
        <Button type="submit">Crear usuario</Button>
      </form>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Usuarios existentes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">Nombre</th>
              <th className="text-left">Email (ID)</th>
              <th className="text-left">Rol</th>
              <th className="text-left">Activo</th>
              <th className="text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td>{u.nombre}</td>
                <td className="text-xs text-gray-500">{u.id}</td>
                <td>
                  <select
                    value={u.rol}
                    onChange={(e) => actualizarPerfil(u.id, 'rol', e.target.value)}
                    className="bg-transparent border rounded"
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={u.activo}
                    onChange={(e) => actualizarPerfil(u.id, 'activo', e.target.checked)}
                  />
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => actualizarPerfil(u.id, 'activo', !u.activo)}
                  >
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
