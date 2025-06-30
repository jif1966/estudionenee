'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function PresupuestoForm({ onSave }: { onSave?: () => void }) {
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !precio) return;

    const { error } = await supabase.from('presupuestos').insert([
      {
        cliente,
        descripcion,
        precio: parseFloat(precio),
      },
    ]);

    if (error) {
      setMensaje('Error al guardar');
      console.error(error);
    } else {
      setMensaje('Presupuesto guardado con éxito');
      setCliente('');
      setDescripcion('');
      setPrecio('');
      onSave?.(); // <-- Esta línea notifica al padre que guarde
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">Nuevo Presupuesto</h2>
      <Input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />
      <Input
        placeholder="Descripción del trabajo"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Precio en ARS"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <Button type="submit" className="w-full">Guardar presupuesto</Button>
      {mensaje && <p className="text-sm text-green-600 mt-2">{mensaje}</p>}
    </form>
  );
}

