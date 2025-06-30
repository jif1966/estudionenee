'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePerfilUsuario } from '@/lib/hooks/usePerfilUsuario';
import { Card, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { exportarResumenProyecto } from '@/lib/exportadores';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function ProyectoDetalle() {
  const { perfil, loading } = usePerfilUsuario();
  const params = useParams();
  const id = params?.id as string;

  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [gastos, setGastos] = useState<any[]>([]);
  const [cobros, setCobros] = useState<any[]>([]);
  const [listoParaCobrar, setListoParaCobrar] = useState(false);
  const [avance, setAvance] = useState(0);

  const [nuevoGasto, setNuevoGasto] = useState({ categoria: '', descripcion: '', monto: '' });
  const [nuevoCobro, setNuevoCobro] = useState({ descripcion: '', monto: '' });

  useEffect(() => {
    if (!id || !perfil || perfil.rol !== 'admin') return;

    supabase
      .from('presupuestos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPresupuesto(data);
          setAvance(data.avance ?? 0);
        }
      });

    cargarListas();
  }, [id, perfil]);

  const cargarListas = async () => {
    const { data: gastosData } = await supabase.from('gastos_proyecto').select('*').eq('presupuesto_id', id);
    if (gastosData) setGastos(gastosData);

    const { data: cobrosData } = await supabase.from('cobros_proyecto').select('*').eq('presupuesto_id', id);
    if (cobrosData) setCobros(cobrosData);
  };

  const actualizarAvance = async (nuevoAvance: number) => {
    setAvance(nuevoAvance);
    await supabase.from('presupuestos').update({ avance: nuevoAvance }).eq('id', id);
  };

  const agregarGasto = async () => {
    const { error } = await supabase.from('gastos_proyecto').insert({
      presupuesto_id: id,
      ...nuevoGasto,
      monto: parseFloat(nuevoGasto.monto),
    });
    if (!error) {
      setNuevoGasto({ categoria: '', descripcion: '', monto: '' });
      cargarListas();
    }
  };

  const agregarCobro = async () => {
    const { error } = await supabase.from('cobros_proyecto').insert({
      presupuesto_id: id,
      ...nuevoCobro,
      monto: parseFloat(nuevoCobro.monto),
    });
    if (!error) {
      setNuevoCobro({ descripcion: '', monto: '' });
      cargarListas();
    }
  };

  const eliminarGasto = async (gastoId: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      await supabase.from('gastos_proyecto').delete().eq('id', gastoId);
      cargarListas();
    }
  };

  const eliminarCobro = async (cobroId: string) => {
    if (confirm('¿Eliminar este cobro?')) {
      await supabase.from('cobros_proyecto').delete().eq('id', cobroId);
      cargarListas();
    }
  };

  const generarResumenCobro = () => {
    exportarResumenProyecto({ presupuesto, gastos, cobros });
  };

  if (loading) return <Loader />;
  if (!perfil || perfil.rol !== 'admin') return <p className="p-6 text-red-500">Acceso denegado</p>;

  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const totalCobros = cobros.reduce((sum, c) => sum + Number(c.monto), 0);
  const saldo = (presupuesto?.precio ?? 0) - totalGastos;
  const saldoColor = saldo < 0 ? 'text-red-600' : 'text-green-600';
  const IconoSaldo = saldo < 0 ? ArrowDownCircle : ArrowUpCircle;

  const dataDonut = [
    { name: 'Avance', value: avance },
    { name: 'Faltante', value: 100 - avance },
  ];
  const COLORS = ['#3b82f6', '#e5e7eb'];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Detalle del Proyecto</h1>

      {presupuesto && (
        <Card>
          <CardContent className="space-y-2">
            <p><strong>Cliente:</strong> {presupuesto.cliente}</p>
            <p><strong>Dirección:</strong> {presupuesto.direccion}</p>
            <p><strong>Precio:</strong> ${presupuesto.precio}</p>
            <p><strong>Estado:</strong> {presupuesto.estado}</p>

            <div className="mt-4">
              <label htmlFor="avance">Avance de obra: {avance}%</label>
              <input
                id="avance"
                type="range"
                min={0}
                max={100}
                step={10}
                value={avance}
                onChange={(e) => actualizarAvance(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-32 h-32 mx-auto mt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataDonut}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dataDonut.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600">
                  {avance}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox id="cobrar" checked={listoParaCobrar} onCheckedChange={setListoParaCobrar} />
              <label htmlFor="cobrar">Listo para cobrar al cliente</label>
              {listoParaCobrar && (
                <Button variant="outline" onClick={generarResumenCobro} className="ml-4">
                  Exportar resumen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <h2 className="font-semibold">Resumen</h2>
          <p>Total Proyecto: ${presupuesto?.precio}</p>
          <p>Total Gastos: ${totalGastos}</p>
          <p>Total Cobrado: ${totalCobros}</p>
          <div className={`flex items-center gap-2 font-bold mt-2 ${saldoColor}`}>
            <IconoSaldo className="w-5 h-5" />
            <span>Saldo actual: ${saldo}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
