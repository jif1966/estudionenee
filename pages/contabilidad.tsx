// pages/contabilidad.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Interfaces ---
interface GastoFijo { id: number; nombre: string; }
interface PagoGastoFijo { id: number; gasto_fijo_id: number; monto_pagado: number; fecha_pago: string; descripcion_adicional?: string; }
interface GastoHistorico { mes_formateado: string; total_gastado: number; }

// --- Componente Modal para Registrar o Editar Pago ---
const ModalRegistrarPago = ({ pago, gasto, isOpen, onClose, onSave }: { pago?: PagoGastoFijo | null; gasto: GastoFijo | null; isOpen: boolean; onClose: () => void; onSave: () => void; }) => {
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (pago) {
                setMonto(String(pago.monto_pagado));
                setFecha(pago.fecha_pago);
                setDescripcion(pago.descripcion_adicional || '');
            } else if (gasto) {
                setMonto('');
                setFecha(new Date().toISOString().split('T')[0]);
                setDescripcion(gasto.nombre === 'Otro' ? '' : gasto.nombre);
            }
        }
    }, [pago, gasto, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gasto || !monto || Number(monto) <= 0) {
            toast.error("El monto debe ser un número mayor a cero.");
            return;
        }
        setLoading(true);
        
        const datos = {
            gasto_fijo_id: gasto.id,
            monto_pagado: Number(monto),
            fecha_pago: fecha,
            descripcion_adicional: descripcion,
            mes: new Date(fecha).getMonth() + 1,
            anio: new Date(fecha).getFullYear()
        };

        const promise = pago
            ? supabase.from('pagos_gastos_fijos').update(datos).eq('id', pago.id)
            : supabase.from('pagos_gastos_fijos').insert(datos);

        const { error } = await promise;
        setLoading(false);

        if (error) {
            toast.error('Error al guardar el pago: ' + error.message);
        } else {
            toast.success(`¡Pago ${pago ? 'actualizado' : 'registrado'} con éxito!`);
            onSave();
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-gray-800">
                <h2 className="text-xl font-bold mb-4">{pago ? 'Editar' : 'Registrar'} Pago: {gasto?.nombre}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {(gasto?.nombre === 'Otro' || (pago && gasto?.nombre !== pago.descripcion_adicional)) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción del Gasto</label>
                            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 mt-1 rounded border border-gray-300" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monto Pagado</label>
                        <input type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} className="w-full p-2 mt-1 rounded border border-gray-300" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 mt-1 rounded border border-gray-300" required />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400">
                            {loading ? 'Guardando...' : 'Guardar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principal de la Página ---
export default function ContabilidadPage() {
    const [saldoCaja, setSaldoCaja] = useState(0);
    const [totalPorCobrar, setTotalPorCobrar] = useState(0);
    const [totalPorPagar, setTotalPorPagar] = useState(0);
    const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
    const [pagosDelPeriodo, setPagosDelPeriodo] = useState<PagoGastoFijo[]>([]);
    const [historialGastos, setHistorialGastos] = useState<GastoHistorico[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoFijo | null>(null);
    const [pagoParaEditar, setPagoParaEditar] = useState<PagoGastoFijo | null>(null);
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        setLoading(true);
        
        const [
            { data: saldoData },
            { data: saldosProyectosData },
            { data: gastosFijosData },
            { data: pagosData },
            { data: historialData, error: historialError }
        ] = await Promise.all([
            supabase.rpc('calcular_saldo_caja_actual'),
            supabase.rpc('get_saldos_totales_proyectos_en_curso'),
            supabase.from('gastos_fijos_mensuales').select('*').eq('activo', true),
            supabase.from('pagos_gastos_fijos').select('*').eq('mes', mesSeleccionado).eq('anio', anioSeleccionado),
            supabase.rpc('get_gastos_fijos_ultimos_12_meses')
        ]);

        setSaldoCaja(saldoData || 0);
        setTotalPorCobrar(saldosProyectosData?.[0]?.total_saldo_a_cobrar || 0);
        setTotalPorPagar(saldosProyectosData?.[0]?.total_saldo_a_pagar || 0);
        setGastosFijos(gastosFijosData || []);
        setPagosDelPeriodo(pagosData || []);
        setHistorialGastos(historialData || []);

        if (historialError) toast.error("Error al cargar el historial de gastos.");
        
        setLoading(false);
    }, [mesSeleccionado, anioSeleccionado]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (gasto: GastoFijo, pago: PagoGastoFijo | null = null) => {
        setGastoSeleccionado(gasto);
        setPagoParaEditar(pago);
        setIsModalOpen(true);
    };

    const handleDeletePago = async (pagoId: number) => {
        if(window.confirm("¿Estás seguro de que quieres borrar este pago? Esta acción no se puede deshacer.")){
            const { error } = await supabase.from('pagos_gastos_fijos').delete().eq('id', pagoId);
            if(error){ toast.error("Error al borrar el pago."); }
            else { toast.success("Pago borrado."); fetchData(); }
        }
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
    
    const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const dineroNetoAIngresar = totalPorCobrar - totalPorPagar;

    return (
        <div className="text-white">
            <ModalRegistrarPago gasto={gastoSeleccionado} pago={pagoParaEditar} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} />
            
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold drop-shadow-lg">Contabilidad General</h1>
                <div className="flex flex-wrap gap-4 justify-end">
                    <div className="bg-black/20 backdrop-blur-md p-3 rounded-lg text-right">
                        <p className="text-xs text-gray-300">Dinero por Cobrar (Clientes)</p>
                        <p className="text-xl font-bold text-yellow-300">{formatCurrency(totalPorCobrar)}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md p-3 rounded-lg text-right">
                        <p className="text-xs text-gray-300">Dinero por Pagar (Proveedores)</p>
                        <p className="text-xl font-bold text-orange-400">{formatCurrency(totalPorPagar)}</p>
                    </div>
                    <div className={`p-4 rounded-lg text-right border-2 ${dineroNetoAIngresar >= 0 ? 'bg-emerald-900/50 border-emerald-500' : 'bg-red-900/50 border-red-500'}`}>
                        <p className="text-sm font-semibold">Dinero Neto a Ingresar</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(dineroNetoAIngresar)}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg text-right border-2 border-emerald-500">
                        <p className="text-sm font-semibold">Saldo Actual en Caja</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(saldoCaja)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-xl font-semibold">Gastos Fijos y Recurrentes</h2>
                    <div className="flex gap-2">
                        <select value={mesSeleccionado} onChange={e => setMesSeleccionado(Number(e.target.value))} className="p-2 rounded bg-white text-gray-800 border border-gray-300">
                            {meses.map((mes, index) => <option key={mes} value={index + 1}>{mes}</option>)}
                        </select>
                        <select value={anioSeleccionado} onChange={e => setAnioSeleccionado(Number(e.target.value))} className="p-2 rounded bg-white text-gray-800 border border-gray-300">
                            {anios.map(anio => <option key={anio} value={anio}>{anio}</option>)}
                        </select>
                    </div>
                </div>
                
                {loading ? <p>Cargando gastos...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {gastosFijos.map(gasto => {
                            const pagosAsociados = pagosDelPeriodo.filter(p => p.gasto_fijo_id === gasto.id);
                            return (
                                <div key={gasto.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col text-sm">
                                    <h3 className="font-bold mb-2 flex-grow">{gasto.nombre}</h3>
                                    <div className="flex-grow space-y-1 mb-3 text-xs">
                                        {pagosAsociados.length > 0 ? (
                                            pagosAsociados.map(pago => (
                                                <div key={pago.id} className="bg-black/20 p-1.5 rounded flex justify-between items-center">
                                                    <span className="font-semibold text-emerald-300">{formatCurrency(pago.monto_pagado)}</span>
                                                    <div className='flex gap-2'>
                                                        <button onClick={() => handleOpenModal(gasto, pago)} className="font-mono text-blue-300 hover:text-blue-100" title="Editar este pago">E</button>
                                                        <button onClick={() => handleDeletePago(pago.id)} className="font-mono text-red-400 hover:text-red-200" title="Borrar este pago">X</button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : <p className="text-gray-400">Sin pagos este mes.</p>}
                                    </div>
                                    <button onClick={() => handleOpenModal(gasto)} className="mt-auto w-full bg-emerald-600/50 hover:bg-emerald-600 text-white font-semibold py-1 px-3 text-sm rounded transition-colors">
                                        + Añadir Pago
                                    </button>
                                </div>
                            );
                        })}
                        <div className="p-3 rounded-lg bg-sky-800/50 flex flex-col justify-center items-center border border-sky-500">
                             <h3 className="font-bold text-md text-center">¿Otro Gasto?</h3>
                             <p className="text-xs text-sky-200 text-center mb-2">Para gastos no recurrentes.</p>
                             <button onClick={() => handleOpenModal({id: 999, nombre: 'Otro'})} className="mt-auto w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-1 px-3 text-sm rounded">
                                Registrar Otro
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6">
                 <h2 className="text-xl font-semibold mb-4">Historial de Gastos Fijos (Últimos 12 Meses)</h2>
                 {loading ? <p>Cargando gráfico...</p> : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={historialGastos} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <XAxis dataKey="mes_formateado" stroke="#a1a1aa" fontSize={12} />
                            <YAxis 
                                stroke="#a1a1aa" 
                                fontSize={12}
                                tickFormatter={(value) => `$${Number(value) / 1000}k`} 
                            />
                            <Tooltip 
                                cursor={{fill: 'rgba(113, 113, 122, 0.3)'}}
                                contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#e4e4e7' }}
                                formatter={(value: number) => [formatCurrency(value), "Total Gastado"]}
                            />
                            <Legend wrapperStyle={{ color: '#e4e4e7' }} />
                            <Bar dataKey="total_gastado" fill="#f97316" name="Gastos Fijos del Mes" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 )}
            </div>
        </div>
    );
}