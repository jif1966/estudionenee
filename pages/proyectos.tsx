// pages/proyectos.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// --- Interfaces para nuestros datos ---
interface Proyecto { id: number; cliente: string; descripcion: string; }
interface Movimiento { id: number; monto: number; fecha: string; descripcion: string; categoria?: string; proveedor?: string; moneda?: 'ARS' | 'USD'; }
interface ItemPresupuesto { id: number; descripcion: string; }

// --- Componente para añadir un nuevo movimiento (AHORA MÁS INTELIGENTE) ---
const FormularioMovimiento = ({ proyectoId, tipo, onSave, itemsDelPresupuesto = [] }: { 
    proyectoId: number; 
    tipo: 'ingreso' | 'egreso'; 
    onSave: () => void;
    itemsDelPresupuesto?: ItemPresupuesto[];
}) => {
    const [monto, setMonto] = useState(0);
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDescripcion('');
        setCategoria('');
    }, [tipo, itemsDelPresupuesto]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const tabla = tipo === 'ingreso' ? 'cobros_cliente' : 'gastos_proyecto';
        const datos = tipo === 'ingreso'
            ? { presupuesto_id: proyectoId, monto, fecha, descripcion, moneda }
            : { presupuesto_id: proyectoId, monto, fecha, descripcion, proveedor, categoria, moneda };

        const { error } = await supabase.from(tabla).insert(datos);
        setLoading(false);

        if (error) {
            toast.error("Error al guardar el movimiento: " + error.message);
        } else {
            toast.success(`¡${tipo === 'ingreso' ? 'Cobro' : 'Pago'} registrado con éxito!`);
            onSave();
            setMonto(0); setDescripcion(''); setProveedor(''); setCategoria(''); setMoneda('ARS');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white/10 rounded-lg mt-4 space-y-4">
            <h4 className="font-bold text-lg">{tipo === 'ingreso' ? 'Registrar Cobro a Cliente' : 'Registrar Pago a Proveedor'}</h4>
            
            {tipo === 'egreso' && (
                <div>
                    <label className="text-xs font-medium">Item Presupuestado</label>
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2 mt-1 rounded bg-white text-gray-800 border border-gray-300" required>
                        <option value="">Selecciona un item...</option>
                        {itemsDelPresupuesto?.map(item => (
                            <option key={item.id} value={item.descripcion}>{item.descripcion}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="text-xs font-medium">Descripción / Detalle</label>
                <input type="text" placeholder="Ej: Seña 50%, Adelanto Herrero" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 mt-1 rounded bg-white text-gray-800 border border-gray-300" required />
            </div>
            
            {tipo === 'egreso' && (
                <div>
                    <label className="text-xs font-medium">Proveedor</label>
                    <input type="text" placeholder="Nombre del Proveedor" value={proveedor} onChange={e => setProveedor(e.target.value)} className="w-full p-2 mt-1 rounded bg-white text-gray-800 border border-gray-300" />
                </div>
            )}
            
            <div>
                <label className="text-xs font-medium">Fecha del Movimiento</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 mt-1 rounded bg-white text-gray-800 border border-gray-300" required />
            </div>

            <div>
                <label className="text-xs font-medium">Monto</label>
                <div className="flex gap-2 mt-1">
                    <input type="number" step="0.01" placeholder="Monto" value={monto} onChange={e => setMonto(Number(e.target.value))} className="flex-grow p-2 rounded bg-white text-gray-800 border border-gray-300" required />
                    <select value={moneda} onChange={e => setMoneda(e.target.value as 'ARS' | 'USD')} className="p-2 rounded bg-white text-gray-800 border border-gray-300">
                        <option value="ARS">$</option>
                        <option value="USD">U$S</option>
                    </select>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold disabled:bg-gray-500">
                {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
        </form>
    );
};


// --- Componente Principal de la Página ---
export default function ProyectosPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);
    const [cobros, setCobros] = useState<Movimiento[]>([]);
    const [gastos, setGastos] = useState<Movimiento[]>([]);
    const [itemsDelPresupuesto, setItemsDelPresupuesto] = useState<ItemPresupuesto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProyectosEnCurso = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('presupuestos').select('id, cliente, descripcion').eq('estado', 'en curso');
            if (data) {
                setProyectos(data);
                if (data.length > 0) {
                    handleSelectProyecto(data[0]);
                }
            }
            if (error) toast.error("Error al cargar proyectos.");
            setLoading(false);
        };
        fetchProyectosEnCurso();
    }, []);
    
    // Lógica de filtrado para el buscador
    const filteredProyectos = useMemo(() => {
        if (!searchTerm) return proyectos;
        return proyectos.filter(p =>
            p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, proyectos]);

    const fetchMovimientos = async (proyectoId: number) => {
        const { data: cobrosData } = await supabase.from('cobros_cliente').select('*').eq('presupuesto_id', proyectoId).order('fecha', { ascending: false });
        const { data: gastosData } = await supabase.from('gastos_proyecto').select('*').eq('presupuesto_id', proyectoId).order('fecha', { ascending: false });
        const { data: itemsData } = await supabase.from('presupuesto_items').select('id, descripcion').eq('presupuesto_id', proyectoId);
        
        setCobros(cobrosData || []);
        setGastos(gastosData || []);
        setItemsDelPresupuesto(itemsData || []);
    };

    const handleSelectProyecto = (proyecto: Proyecto) => {
        setSelectedProyecto(proyecto);
        fetchMovimientos(proyecto.id);
    };

    const formatCurrency = (value: number, currency: 'ARS' | 'USD' = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency }).format(value);

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg mb-6">Proyectos en Curso: Registro de Movimientos</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4">
                        <h2 className="text-xl font-semibold mb-4">Proyectos Activos</h2>
                        <div className="mb-4">
                            <input 
                                type="text"
                                placeholder="Buscar por cliente o proyecto..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        {loading && <p className="text-sm text-gray-300">Cargando...</p>}
                        <ul className="space-y-2 h-[60vh] overflow-y-auto pr-2">
                            {filteredProyectos.map(p => (
                                <li key={p.id} onClick={() => handleSelectProyecto(p)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedProyecto?.id === p.id ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>
                                    <p className="font-bold">{p.cliente}</p>
                                    <p className="text-sm text-gray-300 line-clamp-2">{p.descripcion}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedProyecto ? (
                        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">{selectedProyecto.cliente}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Cobros Recibidos</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                                        {cobros.map(c => <div key={'cobro-'+c.id} className="flex justify-between bg-white/5 p-2 rounded items-center"><div><p>{c.descripcion}</p><p className="text-xs text-gray-400">{new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</p></div><span className="font-medium text-emerald-300">{formatCurrency(c.monto, c.moneda)}</span></div>)}
                                    </div>
                                    <FormularioMovimiento proyectoId={selectedProyecto.id} tipo="ingreso" onSave={() => fetchMovimientos(selectedProyecto.id)} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Pagos a Proveedores</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                                        {gastos.map(g => <div key={'gasto-'+g.id} className="flex justify-between bg-white/5 p-2 rounded items-center"><div><p className="font-medium">{g.categoria}</p><p className="text-xs text-gray-400">{g.descripcion} ({g.proveedor})</p></div><span className="font-medium text-red-300">{formatCurrency(g.monto, g.moneda)}</span></div>)}
                                    </div>
                                    <FormularioMovimiento 
                                        proyectoId={selectedProyecto.id} 
                                        tipo="egreso" 
                                        onSave={() => fetchMovimientos(selectedProyecto.id)} 
                                        itemsDelPresupuesto={itemsDelPresupuesto}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6">
                            <p className="text-gray-300">Selecciona un proyecto para registrar sus cobros y pagos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}