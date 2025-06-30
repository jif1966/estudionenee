// pages/dashboard.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from "react-hot-toast";
import { debounce } from 'lodash';

// --- Interfaces para los datos ---
interface SubProyecto { id: number; descripcion: string; precio: number; estado: string; }
interface ProyectoAgrupado {
  cliente: string;
  proyecto_principal_id: number;
  descripcion_principal: string;
  precio_total: number;
  cobrado_total: number;
  gastado_total: number;
  avance_manual: number;
  sub_proyectos: SubProyecto[];
  saldo_a_cobrar: number;
  saldo_a_pagar: number;
}

// --- Componente de Avance Circular Editable ---
const AvanceCircularEditable = ({ avance, proyectoId }: { avance: number, proyectoId: number }) => {
  const [valorActual, setValorActual] = useState(avance);

  useEffect(() => {
    setValorActual(avance);
  }, [avance]);

  const guardarAvance = async (nuevoAvance: number) => {
    const { error } = await supabase
      .from('presupuestos')
      .update({ avance_manual: nuevoAvance })
      .eq('id', proyectoId);
    
    if (error) {
      toast.error("Error al actualizar el avance.");
    } else {
      toast.success("Avance actualizado a " + nuevoAvance + "%.");
    }
  };
  
  const debouncedSave = useCallback(debounce(guardarAvance, 1000), [proyectoId]);

  const handleUpdate = (nuevoValor: number) => {
    setValorActual(nuevoValor);
    debouncedSave(nuevoValor);
  };

  const handleIncrement = () => {
    const nuevoValor = Math.min(valorActual + 10, 100);
    handleUpdate(nuevoValor);
  };
  
  const handleDecrement = () => {
    const nuevoValor = Math.max(valorActual - 10, 0);
    handleUpdate(nuevoValor);
  };

  const radio = 30;
  const circumferencia = 2 * Math.PI * radio;
  const offset = circumferencia - (valorActual / 100) * circumferencia;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full" viewBox="0 0 80 80">
          <circle className="stroke-current text-gray-700/50" strokeWidth="8" fill="transparent" r={radio} cx="40" cy="40"/>
          <motion.circle
            className="stroke-current text-emerald-400"
            strokeWidth="8"
            fill="transparent"
            r={radio}
            cx="40"
            cy="40"
            strokeDasharray={circumferencia}
            strokeDashoffset={circumferencia}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
          {valorActual}%
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 bg-black/20 p-1 rounded-lg">
        <button onClick={handleDecrement} className="px-3 py-1 rounded-md text-white font-bold text-lg hover:bg-white/20">-</button>
        <button onClick={handleIncrement} className="px-3 py-1 rounded-md text-white font-bold text-lg hover:bg-white/20">+</button>
      </div>
    </div>
  );
};

// --- Icono Chevron ---
const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

// --- Componente Principal del Dashboard ---
export default function DashboardPage() {
  const [proyectos, setProyectos] = useState<ProyectoAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const fetchProyectos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('get_dashboard_agrupado_por_cliente');
      if (rpcError) throw rpcError;
      if (data) setProyectos(data);
    } catch (err: any) {
      setError("No se pudieron cargar los proyectos. " + err.message);
      toast.error("Error al cargar los datos del dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);
  
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) { newSet.delete(id); }
      else { newSet.add(id); }
      return newSet;
    });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  if (loading) return <div className="text-center text-white/80 p-10">Cargando dashboard...</div>;
  if (error) return <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg"><strong>Error:</strong> {error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Proyectos en Curso
        </h1>
        <Link href="/presupuestos" className="px-4 py-2 bg-white/90 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-white transition-colors">
            + Nuevo Proyecto
        </Link>
      </div>

      {proyectos.length === 0 ? (
        <div className="text-center text-white/70 bg-black/20 p-8 rounded-lg">
            <p>No hay proyectos en ejecución.</p>
            <p className="text-sm mt-2">Ve a "Presupuestos", crea uno y márcalo como "en curso" para verlo aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectos.map((p, index) => {
            const pendienteDeIngreso = p.saldo_a_cobrar - p.saldo_a_pagar;
            const cardBorderColor = pendienteDeIngreso >= 0 ? 'border-emerald-500/50' : 'border-red-500/50';

            return (
              <motion.div 
                  key={p.proyecto_principal_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-5 border ${cardBorderColor} flex flex-col justify-between`}
              >
                  {/* SECCIÓN SUPERIOR DE LA TARJETA (RESTAURADA) */}
                  <div>
                      <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                              <p className="text-sm text-gray-300">Cliente</p>
                              <h2 className="text-xl font-bold text-white truncate">{p.cliente}</h2>
                              <p className="text-sm text-cyan-300 line-clamp-2">{p.descripcion_principal}</p>
                          </div>
                          <AvanceCircularEditable avance={p.avance_manual} proyectoId={p.proyecto_principal_id} />
                      </div>
                  </div>
                  
                  {/* SECCIÓN DESPLEGABLE DE SUB-PROYECTOS */}
                  <div className="mt-4">
                      <button onClick={() => toggleExpand(p.proyecto_principal_id)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left p-1 -ml-1">
                          <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedIds.has(p.proyecto_principal_id) ? 'rotate-90' : ''}`} />
                          <span>Detalle de Presupuestos</span>
                      </button>
                      {expandedIds.has(p.proyecto_principal_id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-2 pl-4 border-l-2 border-white/20 space-y-1 overflow-hidden"
                          >
                              {p.sub_proyectos.map(sub => (
                                  <div key={sub.id} className="text-xs flex justify-between">
                                      <span className="text-gray-300 truncate pr-2">{sub.descripcion}</span>
                                      <span className="text-gray-100 font-medium whitespace-nowrap">{formatCurrency(sub.precio)}</span>
                                  </div>
                              ))}
                          </motion.div>
                      )}
                  </div>

                  {/* SECCIÓN DE RESUMEN FINANCIERO (ACTUALIZADA) */}
                  <div className="mt-4 pt-4 border-t border-white/20 text-sm space-y-2">
                      <div className="flex justify-between text-white font-bold">
                          <span>Total Presupuestado:</span>
                          <span>{formatCurrency(p.precio_total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-200">
                          <span>Total Cobrado:</span>
                          <span className="font-semibold text-emerald-300">{formatCurrency(p.cobrado_total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-200">
                          <span>Total Gastado:</span>
                          <span className="font-semibold text-red-300">{formatCurrency(p.gastado_total)}</span>
                      </div>
                      
                      <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
                          <div className="flex justify-between text-amber-300">
                              <span className="font-semibold">Saldo a cobrar al cliente:</span>
                              <span className="font-bold">{formatCurrency(p.saldo_a_cobrar)}</span>
                          </div>
                          <div className="flex justify-between text-orange-400">
                              <span className="font-semibold">Saldo a pagar a proveedores:</span>
                              <span className="font-bold">{formatCurrency(p.saldo_a_pagar)}</span>
                          </div>
                          <div className={`flex justify-between font-bold text-lg pt-2`}>
                              {/* ETIQUETA ACTUALIZADA */}
                              <span>Total por entrar:</span>
                              <span className={pendienteDeIngreso >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {formatCurrency(pendienteDeIngreso)}
                              </span>
                          </div>
                      </div>
                  </div>
              </motion.div>
            )
          })}
          </div>
        )}
    </motion.div>
  );
}