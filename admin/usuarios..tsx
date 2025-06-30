'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';

interface Perfil {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
}

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = async () => {
    setCargando(true);
    const { data } = await supabase.from('perfiles').select('*').order('email');
    if (data) setUsuarios(data as Perfil[]);
    setCargando(false);
  };

  const actualizarUsuario = async (id: string, campo: string, valor: any) => {
    await supabase.from('perfiles').update({ [campo]: valor }).eq('id', id);
    cargarUsuarios();
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (cargando) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <Card key={usuario.id}>
              <CardContent className="space-y-2 p-4">
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Nombre:</strong> {usuario.nombre}</p>

                <div className="flex gap-4 items-center">
                  <label><strong>Rol:</strong></label>
                  <Select
                    value={usuario.rol}
                    onValueChange={(valor) => actualizarUsuario(usuario.id, 'rol', valor)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="usuario">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <label><strong>Activo:</strong></label>
                  <Button
                    variant={usuario.activo ? 'default' : 'outline'}
                    onClick={() => actualizarUsuario(usuario.id, 'activo', !usuario.activo)}
                  >
                    {usuario.activo ? 'Sí' : 'No'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
