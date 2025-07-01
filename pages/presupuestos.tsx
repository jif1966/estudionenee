// pages/presupuestos.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { getPresupuestos } from "@/lib/presupuestos-service";
import toast from "react-hot-toast";
import React from "react";
import { debounce } from 'lodash';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, ImageRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from "@/contexts/AuthContext";

// --- Interfaces y Opciones ---
type PresupuestoEstado = 'presupuestado' | 'en curso' | 'finalizado' | 'cancelado' | 'no aceptado';
interface Presupuesto { id: number; cliente: string; descripcion: string; telefono?: string; mail?: string; direccion?: string; margen_ganancia: number; estado: PresupuestoEstado; presupuesto_padre_id?: number | null; }
interface Item { id: number; descripcion: string; costo: number; categoria: string; moneda: 'ARS' | 'USD'; descripcion_cliente?: string | null; }
const opcionesDescripcion = [ "carpinteria", "herreria", "electricidad", "flete", "instalaciones", "herrajes", "comisiones", "otros" ];
const formatCurrency = (value: number, currency: 'ARS' | 'USD' = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency }).format(value);

// --- Iconos y Modales ---
const ChevronRightIcon = ({ className }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg> );

const ModalCrearPresupuesto = ({ isOpen, onClose, onSave, parentPresupuesto = null }: { isOpen: boolean, onClose: () => void, onSave: () => void, parentPresupuesto?: Presupuesto | null }) => {
  const [nuevo, setNuevo] = useState({ cliente: '', descripcion: '', telefono: '', mail: '', direccion: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parentPresupuesto && isOpen) {
      setNuevo({
        cliente: parentPresupuesto.cliente,
        descripcion: 'Adicional: ',
        telefono: parentPresupuesto.telefono || '',
        mail: parentPresupuesto.mail || '',
        direccion: parentPresupuesto.direccion || '',
      });
    } else if (!isOpen) {
      setNuevo({ cliente: '', descripcion: '', telefono: '', mail: '', direccion: '' });
    }
  }, [parentPresupuesto, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.from('presupuestos').insert({ 
        ...nuevo, 
        estado: 'presupuestado', 
        fecha: new Date().toISOString(),
        margen_ganancia: 15,
        presupuesto_padre_id: parentPresupuesto?.id || null,
    });
    setLoading(false);
    if (error) { toast.error('Error al guardar: ' + error.message); }
    else { toast.success(parentPresupuesto ? '¡Adicional creado!' : '¡Presupuesto creado!'); onSave(); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-gray-800">
        <h2 className="text-2xl font-bold mb-6">{parentPresupuesto ? `Crear Adicional para: ${parentPresupuesto.cliente}` : 'Crear Nuevo Proyecto Principal'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            {!parentPresupuesto && (
              <>
                <input type="text" placeholder="Nombre y Apellido del Cliente" value={nuevo.cliente} onChange={e => setNuevo({...nuevo, cliente: e.target.value})} className="p-3 w-full rounded border" required/>
                <input type="email" placeholder="Mail" value={nuevo.mail} onChange={e => setNuevo({...nuevo, mail: e.target.value})} className="p-3 w-full rounded border"/>
                <input type="tel" placeholder="Teléfono" value={nuevo.telefono} onChange={e => setNuevo({...nuevo, telefono: e.target.value})} className="p-3 w-full rounded border"/>
                <input type="text" placeholder="Dirección de la Obra" value={nuevo.direccion} onChange={e => setNuevo({...nuevo, direccion: e.target.value})} className="p-3 w-full rounded border"/>
              </>
            )}
            <textarea placeholder="Descripción del adicional o proyecto" value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} className="p-3 w-full rounded border" rows={3}/>
            <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400">
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const ModalEditarItem = ({ item, isOpen, onClose, onSave }: { item: Item | null, isOpen: boolean, onClose: () => void, onSave: () => void }) => {
    const [descripcionCliente, setDescripcionCliente] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (item) { setDescripcionCliente(item.descripcion_cliente || ''); }
    }, [item]);
    const handleSave = async () => {
        if (!item) return;
        setLoading(true);
        const { error } = await supabase.from('presupuesto_items').update({ descripcion_cliente: descripcionCliente }).eq('id', item.id);
        setLoading(false);
        if (error) { toast.error("Error al guardar la descripción."); }
        else { toast.success("Descripción guardada."); onSave(); onClose(); }
    };
    if (!isOpen || !item) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl text-gray-800">
                <h2 className="text-2xl font-bold mb-2">Detalle para el Cliente</h2>
                <p className="text-gray-600 mb-4">Item interno: <span className="font-semibold">{item.descripcion}</span></p>
                <textarea placeholder="Escribe aquí la descripción detallada que verá el cliente en el PDF..." value={descripcionCliente} onChange={(e) => setDescripcionCliente(e.target.value)} className="w-full p-3 rounded border border-gray-300 h-40"/>
                <div className="flex gap-4 mt-4">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                        {loading ? 'Guardando...' : 'Guardar Descripción'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PresupuestosPage() {
  const { hasPermission } = useAuth();
  const isAdmin = useMemo(() => hasPermission('manage_presupuestos'), [hasPermission]);

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({ descripcion: '', costo: 0, categoria: '', moneda: 'ARS' as 'ARS' | 'USD' });
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [parentForNew, setParentForNew] = useState<Presupuesto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchPresupuestos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await getPresupuestos();
        setPresupuestos(data);
    } catch (error: any) {
        setError("Hubo un error al cargar los datos de presupuestos.");
        toast.error("Error al cargar presupuestos.");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresupuestos();
  }, [fetchPresupuestos]);

  const fetchItems = async (presupuestoId: number) => {
    const { data } = await supabase.from('presupuesto_items').select('*').eq('presupuesto_id', presupuestoId).order('created_at');
    setItems(data || []);
  };

  const handleSelectPresupuesto = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    fetchItems(presupuesto.id);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescription = newItem.descripcion === 'otros' ? customDescription : newItem.descripcion;
    if (!selectedPresupuesto || !finalDescription || newItem.costo <= 0) {
      toast.error('Por favor, completa todos los campos del item.');
      return;
    }
    const { error } = await supabase.from('presupuesto_items').insert({
      presupuesto_id: selectedPresupuesto.id,
      descripcion: finalDescription,
      costo: newItem.costo,
      categoria: newItem.categoria,
      moneda: newItem.moneda,
    });
    if (error) { toast.error('Error al añadir el item: ' + error.message); }
    else {
      toast.success('Item añadido.');
      fetchItems(selectedPresupuesto.id);
      setNewItem({ descripcion: '', costo: 0, categoria: '', moneda: 'ARS' });
      setCustomDescription('');
    }
  };
 
  const handleUpdateStatus = async (presupuesto: Presupuesto, nuevoEstado: PresupuestoEstado) => {
    const { error } = await supabase.from('presupuestos').update({ estado: nuevoEstado }).eq('id', presupuesto.id);
    if (error) { toast.error('Error al cambiar el estado.'); }
    else {
      toast.success(`Estado cambiado a: ${nuevoEstado}`);
      fetchPresupuestos();
      if (selectedPresupuesto && selectedPresupuesto.id === presupuesto.id) {
          setSelectedPresupuesto({ ...selectedPresupuesto, estado: nuevoEstado });
      }
    }
  };

  const debouncedUpdateMargen = useMemo(() =>
    debounce(async (presupuestoId, nuevoMargen) => {
        const { error } = await supabase.from('presupuestos').update({ margen_ganancia: nuevoMargen }).eq('id', presupuestoId);
        if (error) { toast.error('No se pudo actualizar el margen.'); }
        else { toast.success('Margen de ganancia actualizado.'); }
    }, 1000), []);

  const handleMargenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPresupuesto) return;
    const nuevoMargen = Number(e.target.value);
    setSelectedPresupuesto(prev => prev ? { ...prev, margen_ganancia: nuevoMargen } : null);
    debouncedUpdateMargen(selectedPresupuesto.id, nuevoMargen);
  };
 
  const handleDeletePresupuesto = async (presupuestoId: number, cliente: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto de "${cliente}"? Esta acción es irreversible y eliminará todos sus adicionales e items.`)) {
        toast.loading('Eliminando proyecto...');
        const { error } = await supabase.from('presupuestos').delete().eq('id', presupuestoId);
        toast.dismiss();
        if (error) {
            toast.error(`Error al eliminar: ${error.message}`);
        } else {
            toast.success('Proyecto eliminado con éxito.');
            setSelectedPresupuesto(null);
            setItems([]);
            fetchPresupuestos();
        }
    }
  };
 
  const { parentPresupuestos, childrenMap } = useMemo(() => {
    const parentPresupuestos: Presupuesto[] = [];
    const childrenMap = new Map<number, Presupuesto[]>();
    for (const p of presupuestos) {
      if (p.presupuesto_padre_id) {
        if (!childrenMap.has(p.presupuesto_padre_id)) {
          childrenMap.set(p.presupuesto_padre_id, []);
        }
        childrenMap.get(p.presupuesto_padre_id)!.push(p);
      } else {
        parentPresupuestos.push(p);
      }
    }
    return { parentPresupuestos, childrenMap };
  }, [presupuestos]);
 
  const filteredPresupuestos = useMemo(() => {
    if (!searchTerm) return parentPresupuestos;
    return parentPresupuestos.filter(p =>
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.direccion && p.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, parentPresupuestos]);

  const { costoTotal, precioFinalCliente } = useMemo(() => {
    const costoTotal = items.reduce((sum, item) => item.moneda === 'USD' ? sum + item.costo * 1000 : sum + item.costo, 0);
    const ganancia = costoTotal * ((selectedPresupuesto?.margen_ganancia || 0) / 100);
    const precioFinalCliente = costoTotal + ganancia;
    return { costoTotal, precioFinalCliente };
  }, [items, selectedPresupuesto?.margen_ganancia]);
 
  const openCreateModal = (parent: Presupuesto | null = null) => { setParentForNew(parent); setCreateModalOpen(true); };
 
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) { newSet.delete(id); }
      else { newSet.add(id); }
      return newSet;
    });
  };

  const loadImageAsArrayBuffer = (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () { resolve(xhr.response as ArrayBuffer); };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.send();
    });
  };

  const handleExportPDF = async () => {
    if (!selectedPresupuesto) return;
    toast.loading('Generando PDF...');
    try {
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString('es-AR');
       
        try {
            const logoBlob = await fetch('/logo.webp').then(res => {
                if (!res.ok) throw new Error('Logo not found');
                return res.blob();
            });
            const logoBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(logoBlob);
            });
            const logoWidth = 50; 
            const logoHeight = (70 / 256) * logoWidth;
            doc.addImage(logoBase64, 'WEBP', 145, 8, logoWidth, logoHeight);
        } catch (e) {
            console.warn("No se pudo cargar el logo, se omitirá del PDF.");
        }
       
        doc.setFontSize(10);
        doc.text('Diseño y Producción de Mobiliario', 195, 42, { align: 'right' });
        doc.setFontSize(14);
        doc.text('Presupuesto', 15, 50);
        doc.setFontSize(11);
        doc.text(`Cliente: ${selectedPresupuesto.cliente}`, 15, 60);
        doc.text(`Proyecto: ${selectedPresupuesto.descripcion}`, 15, 66);
        doc.text(`Fecha: ${fecha}`, 195, 60, { align: 'right' });

        const tableBody = items
            .filter(item => item.descripcion_cliente)
            .map(item => [item.descripcion_cliente!]);

        autoTable(doc, {
            startY: 75,
            head: [['Descripción Detallada']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [34, 34, 34] }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.text('Total Presupuestado:', 140, finalY + 15, { align: 'right' });
        doc.text(formatCurrency(precioFinalCliente), 195, finalY + 15, { align: 'right' });
        doc.setFontSize(9);
        doc.text('Presupuesto válido por 15 días. No incluye IVA (21%).', 15, finalY + 30);
       
        toast.dismiss();
        doc.save(`Presupuesto-${selectedPresupuesto.cliente}.pdf`);
    } catch (error: any) {
        toast.dismiss();
        toast.error(error.message || "Error al generar el PDF.");
        console.error(error);
    }
  };

    if (loading) return <div className="text-center text-white/80">Cargando presupuestos...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="text-white">
      <ModalCrearPresupuesto isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSave={fetchPresupuestos} parentPresupuesto={parentForNew} />
      <ModalEditarItem item={editingItem} isOpen={!!editingItem} onClose={() => setEditingItem(null)} onSave={() => fetchItems(selectedPresupuesto!.id)} />
      <h1 className="text-3xl font-bold drop-shadow-lg mb-6">Gestión de Presupuestos</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/20">
              <h2 className="text-xl font-semibold">Proyectos Principales</h2>
              <button onClick={() => openCreateModal(null)} title="Crear Nuevo Proyecto Principal" className="px-3 py-1 text-lg rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold">+</button>
            </div>
            <div className="mb-4">
                <input type="text" placeholder="Buscar por cliente o dirección..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
            </div>
            <ul className="space-y-1 h-[55vh] overflow-y-auto pr-2">
              {filteredPresupuestos.map(p => (
                <React.Fragment key={p.id}>
                    <li onClick={() => handleSelectPresupuesto(p)} className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${selectedPresupuesto?.id === p.id ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>
                        <div>
                            <span className="font-bold truncate">{p.cliente}</span>
                            <p className="text-sm text-gray-300 truncate">{p.descripcion}</p>
                            <div className="mt-2">
                                <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full 
                                    ${p.estado === 'en curso' ? 'bg-yellow-500 text-yellow-900' :
                                    p.estado === 'finalizado' ? 'bg-emerald-500 text-emerald-900' :
                                    p.estado === 'no aceptado' || p.estado === 'cancelado' ? 'bg-red-500 text-red-900' :
                                    'bg-gray-500 text-gray-900'}`}>
                                    {p.estado}
                                </span>
                            </div>
                        </div>
                        {childrenMap.has(p.id) && (<button onClick={(e) => { e.stopPropagation(); toggleExpand(p.id); }} className="p-1 rounded-full hover:bg-white/20"><ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedIds.has(p.id) ? 'rotate-90' : ''}`} /></button>)}
                    </li>
                    {expandedIds.has(p.id) && childrenMap.get(p.id)?.map(child => (
                        <li key={child.id} onClick={(e) => { e.stopPropagation(); handleSelectPresupuesto(child); }} className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ml-6 border-l-2 border-white/20 ${selectedPresupuesto?.id === child.id ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>
                            <div><span className="font-medium truncate">{child.descripcion || 'Adicional'}</span><p className={`capitalize text-xs`}>{child.estado}</p></div>
                        </li>
                    ))}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedPresupuesto ? (
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold truncate">{selectedPresupuesto.cliente}</h2>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => openCreateModal(selectedPresupuesto)} className="px-3 py-2 text-xs rounded bg-green-500 hover:bg-green-600">+ Añadir Adicional</button>
                        <button onClick={handleExportPDF} className="px-3 py-2 text-xs rounded bg-blue-500 hover:bg-blue-600">Exportar PDF</button>
                        {isAdmin && (
                            <button 
                                onClick={() => handleDeletePresupuesto(selectedPresupuesto.id, selectedPresupuesto.cliente)} 
                                className="px-3 py-2 text-xs rounded bg-red-600 hover:bg-red-700 font-semibold"
                            >
                                Eliminar Proyecto
                            </button>
                        )}
                    </div>
                 </div>
                 <div>
                    <h3 className="font-semibold mb-2">Items de Costo (Uso Interno)</h3>
                    <div className="space-y-2 mb-4 bg-black/10 p-4 rounded-lg max-h-64 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between bg-white/5 p-2 rounded items-center">
                                <div><p className="font-semibold">{item.descripcion}</p><p className="text-xs text-gray-400">Proveedor: {item.categoria || 'N/A'}</p><p className="text-xs text-cyan-300 mt-1 truncate max-w-xs sm:max-w-sm md:max-w-md">↳ {item.descripcion_cliente || 'Sin detalle para el cliente.'}</p></div>
                                <div className="flex items-center gap-4"><span className="font-semibold">{formatCurrency(item.costo, item.moneda)}</span><button onClick={() => setEditingItem(item)} className="text-xs bg-white/10 p-1 px-2 rounded hover:bg-white/20">Editar</button></div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 p-3 bg-white/10 rounded-md">
                        <div className="sm:col-span-3"><label className="text-xs font-medium">Descripción</label><select value={newItem.descripcion} onChange={e => setNewItem({...newItem, descripcion: e.target.value})} className="p-2 rounded bg-white text-gray-800 w-full mt-1" required><option value="">Selecciona un tipo...</option>{opcionesDescripcion.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}</select></div>
                        {newItem.descripcion === 'otros' && (<div className="sm:col-span-3"><label className="text-xs font-medium">Descripción Personalizada</label><input type="text" placeholder="Escribe aquí..." value={customDescription} onChange={e => setCustomDescription(e.target.value)} className="p-2 rounded bg-white text-gray-800 w-full mt-1" required/></div>)}
                        <div><label className="text-xs font-medium">Proveedor</label><input type="text" placeholder="Nombre del proveedor" value={newItem.categoria} onChange={e => setNewItem({...newItem, categoria: e.target.value})} className="p-2 rounded bg-white text-gray-800 w-full mt-1"/></div>
                        <div className="sm:col-span-2 flex gap-2"><div className="flex-grow"><label className="text-xs font-medium">Monto</label><input type="number" step="0.01" placeholder="Costo" value={newItem.costo} onChange={e => setNewItem({...newItem, costo: Number(e.target.value)})} className="p-2 rounded bg-white text-gray-800 w-full mt-1" required/></div><div><label className="text-xs font-medium">Moneda</label><select value={newItem.moneda} onChange={e => setNewItem({...newItem, moneda: e.target.value as 'ARS' | 'USD'})} className="p-2 rounded bg-white text-gray-800 w-full mt-1 h-[42px]"><option value="ARS">$</option><option value="USD">U$S</option></select></div></div>
                        <button type="submit" className="w-full p-2 rounded bg-emerald-500 hover:bg-emerald-600 font-bold sm:col-span-3">Añadir Item</button>
                    </form>
                 </div>
                 <div className="mt-6 pt-6 border-t border-white/20 space-y-3 text-lg">
                    <div className="flex justify-between items-center"><span>Margen de Ganancia:</span><div className="flex items-center gap-2"><input type="number" value={selectedPresupuesto.margen_ganancia} onChange={handleMargenChange} className="p-1 rounded bg-white/20 w-20 text-center font-bold"/><span>%</span></div></div>
                    <div className="flex justify-between text-gray-300"><span>Costo Total (Interno):</span><span>{formatCurrency(costoTotal)}</span></div>
                    <div className="flex justify-between font-bold text-2xl pt-2 border-t border-white/10"><span>PRECIO FINAL (Cliente):</span><span>{formatCurrency(precioFinalCliente)}</span></div>
                    <div className="flex justify-center flex-wrap gap-2 pt-4">
                        <button onClick={() => handleUpdateStatus(selectedPresupuesto, 'en curso')} className="px-4 py-2 text-base rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={selectedPresupuesto.estado === 'en curso'}>Poner en Curso</button>
                        <button onClick={() => handleUpdateStatus(selectedPresupuesto, 'finalizado')} className="px-4 py-2 text-base rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={selectedPresupuesto.estado === 'finalizado'}>Marcar como Finalizado</button>
                        <button onClick={() => handleUpdateStatus(selectedPresupuesto, 'no aceptado')} className="px-4 py-2 text-base rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={selectedPresupuesto.estado === 'no aceptado'}>No Aceptado</button>
                        <button onClick={() => handleUpdateStatus(selectedPresupuesto, 'cancelado')} className="px-4 py-2 text-base rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={selectedPresupuesto.estado === 'cancelado'}>Cancelar</button>
                    </div>
                 </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-6"><p className="text-gray-300">Selecciona un proyecto principal de la izquierda para ver sus detalles o crea uno nuevo con el botón `+`.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}