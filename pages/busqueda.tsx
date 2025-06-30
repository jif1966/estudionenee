/*
  Archivo: /pages/busqueda.tsx
  Pantalla de búsqueda de proyectos con:
  - Filtros por cliente, dirección y fechas (desde/hasta)
  - Resultados en tabla
  - Exportación a Excel (xlsx) y PDF con logo y datos de Estudio Nenee
*/

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BusquedaPage() {
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);

  const buscar = async () => {
    let query = supabase.from('presupuestos').select('*');

    if (cliente) query = query.ilike('cliente', `%${cliente}%`);
    if (direccion) query = query.ilike('direccion', `%${direccion}%`);
    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta);

    const { data, error } = await query.order('fecha', { ascending: false });

    if (!error && data) {
      setResultados(data);
    }
  };

  useEffect(() => {
    buscar();
  }, []);

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(resultados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proyectos');
    XLSX.writeFile(wb, 'proyectos.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // NOTA: Asumiendo que tienes un logo en la carpeta /public
    // doc.addImage('/logo-nenee.png', 'PNG', 10, 10, 30, 30);
    doc.setFontSize(10);
    doc.text('Estudio Nenee', 160, 15, { align: 'right' });
    doc.text('CUIT: 30-71848839-3', 160, 21, { align: 'right' });
    doc.text('info@estudionenne.com', 160, 27, { align: 'right' });
    doc.text('+54 911 3027-1685', 160, 33, { align: 'right' });

    doc.setFontSize(14);
    doc.text('Resumen de Proyectos', 105, 50, { align: 'center' });

    autoTable(doc, {
      startY: 60,
      head: [['Cliente', 'Dirección', 'Fecha', 'Estado', 'Monto']].map(row => row.map(String)),
      body: resultados.map(p => [
        p.cliente,
        p.direccion,
        new Date(p.fecha).toLocaleDateString(),
        p.estado,
        formatCurrency(p.precio)
      ]),
    });

    const total = resultados.reduce((sum, p) => sum + Number(p.precio), 0);
    doc.setFontSize(12);
    // @ts-ignore
    doc.text(`Total: ${formatCurrency(total)}`, 200, doc.lastAutoTable.finalY + 10, { align: 'right' });

    doc.save('proyectos.pdf');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Búsqueda de Proyectos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        <Input placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={buscar}>Buscar</Button>
        <Button onClick={exportarExcel} variant="outline">Exportar Excel</Button>
        <Button onClick={exportarPDF} variant="outline">Exportar PDF</Button>
      </div>

      <div className="bg-white shadow rounded p-4">
        {resultados.length === 0 ? (
          <p className="text-muted-foreground">No se encontraron resultados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cliente</th>
                <th className="text-left py-2">Dirección</th>
                <th className="text-left py-2">Fecha</th>
                <th className="text-left py-2">Estado</th>
                <th className="text-right py-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-1">{p.cliente}</td>
                  <td className="py-1">{p.direccion}</td>
                  <td className="py-1">{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="py-1">{p.estado}</td>
                  <td className="py-1 text-right">{formatCurrency(p.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}