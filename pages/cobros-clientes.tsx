'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';

type Presupuesto = {
  id: string;
  cliente: string;
  descripcion: string;
};

type Cobro = {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
};

export default function CobrosClientesPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<string>('');
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');

  const cargarPresupuestos = async () => {
    const { data, error } = await supabase
      .from('presupuestos')
      .select('id, cliente, descripcion')
      .eq('estado', 'en ejecución')
      .order('fecha', { ascending: false });

    if (!error && data) {
      setPresupuestos(data);
    }
  };

  const cargarCobros = async (presupuesto_id: string) => {
    const { data, error } = await supabase
      .from('cobros_cliente')
      .select('*')
      .eq('presupuesto_id', presupuesto_id)
      .order('fecha', { ascending: false });

    if (!error && data) {
      setCobros(data);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  useEffect(() => {
    if (presupuestoSeleccionado) {
      cargarCobros(presupuestoSeleccionado);
    }
  }, [presupuestoSeleccionado]);

  const handleGuardarCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !presupuestoSeleccionado) return;

    const { error } = await supabase.from('cobros_cliente').insert([
      {
        presupuesto_id: presupuestoSeleccionado,
        descripcion,
        monto: parseFloat(monto),
      },
    ]);

    if (!error) {
      setDescripcion('');
      setMonto('');
      cargarCobros(presupuestoSeleccionado);
    } else {
      console.error('Error al guardar cobro:', error.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cobros al Cliente</h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Seleccionar presupuesto en ejecución:</label>
        <select
          value={presupuestoSeleccionado}
          onChange={(e) => setPresupuestoSeleccionado(e.target.value)}
          className="w-full border rounded-md px-3 py-2 bg-white"
        >
          <option value="">-- Seleccionar --</option>
          {presupuestos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.cliente} – {p.descripcion}
            </option>
          ))}
        </select>
      </div>

      {presupuestoSeleccionado && (
        <>
          <form onSubmit={handleGuardarCobro} className="space-y-4 mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Registrar nuevo cobro</h2>

            <div>
              <label className="block mb-1 text-sm">Descripción (opcional)</label>
              <Input
                placeholder="Ej: anticipo, pago parcial"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Monto</label>
              <Input
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Guardar cobro
            </Button>
          </form>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cobros registrados</h2>
            {cobros.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay cobros ingresados.</p>
            ) : (
              <ul className="space-y-2">
                {cobros.map((c) => (
                  <li key={c.id} className="border rounded p-3 bg-gray-50 shadow-sm">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{c.descripcion || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{formatCurrency(c.monto)}</p>
                        <p className="text-xs text-gray-400">{new Date(c.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
