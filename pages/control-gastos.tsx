/*
  Archivo: /pages/control-gastos.tsx
  Solo accesible para usuarios con rol 'admin'
*/

'use client';

import { useEffect, useState } from 'react';
import { usePerfilUsuario } from '@/lib/hooks/usePerfilUsuario';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function ControlGastosPage() {
  const { perfil, loading } = usePerfilUsuario();
  const [proyectos, setProyectos] = useState<any[]>([]);

  useEffect(() => {
    if (perfil?.rol === 'admin') {
      supabase
        .from('presupuestos')
        .select('*')
        .eq('estado', 'en ejecucion')
        .then(({ data }) => {
          if (data) setProyectos(data);
        });
    }
  }, [perfil]);

  if (loading) return <Loader />;

  if (!perfil || perfil.rol !== 'admin') {
    return <p className="text-center mt-10 text-red-500 font-semibold">No tenés permiso para ver esta sección.</p>;
  }

  const totalPorCobrar = proyectos.reduce((sum, p) => sum + Number(p.precio ?? 0), 0);
  const dataBarra = proyectos.map((p) => ({ nombre: p.cliente, monto: p.precio }));
  const dataTorta = [
    { nombre: 'Total por cobrar', valor: totalPorCobrar },
    { nombre: 'Pagado', valor: 0 },
  ];
  const colores = ['#8884d8', '#00C49F'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Control de Gastos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="h-80">
            <h2 className="text-lg font-semibold mb-2">Proyectos en Ejecución</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarra}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="monto" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="h-80">
            <h2 className="text-lg font-semibold mb-2">Totales</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataTorta} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={80}>
                  {dataTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
