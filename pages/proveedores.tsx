'use client';

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState } from "react";

// Interfaz para definir la estructura de un proveedor
interface Proveedor {
  nombre: string;
  apellido: string;
  mail: string;
  telefono: string;
  direccion: string;
}

export default function ProveedoresPage() {
  // --- ESTADO ---
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [nuevo, setNuevo] = useState<Proveedor>({
    nombre: "", apellido: "", mail: "", telefono: "", direccion: ""
  });
  // 1. Se añade el estado para controlar el Sidebar (esto corrige el error)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- LÓGICA ---
  const agregarProveedor = () => {
    // Simple validación para no agregar proveedores vacíos
    if (!nuevo.nombre.trim()) {
      alert("El nombre del proveedor es obligatorio.");
      return;
    }
    setProveedores([...proveedores, nuevo]);
    // Limpiar el formulario después de agregar
    setNuevo({ nombre: "", apellido: "", mail: "", telefono: "", direccion: "" });
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex text-white">
      {/* 2. Se pasa la propiedad 'isOpen' al Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      <main className="ml-64 p-6 w-full">
        <Header title="Proveedores" />
        
        {/* Contenedor principal con estilos oscuros */}
        <div className="space-y-6 bg-black/20 backdrop-blur-md rounded-xl p-6">
          
          {/* Formulario para agregar proveedores */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Proveedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nombre o Razón Social" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Apellido o Contacto" value={nuevo.apellido} onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Correo" value={nuevo.mail} onChange={(e) => setNuevo({ ...nuevo, mail: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Teléfono" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
              <input className="md:col-span-2 bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Dirección" value={nuevo.direccion} onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })} />
            </div>
            <button onClick={agregarProveedor} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded transition-colors">
              Agregar Proveedor
            </button>
          </div>

          {/* Lista de proveedores agregados */}
          <div className="pt-6 border-t border-white/20">
             <h2 className="text-xl font-semibold mb-4">Lista de Proveedores</h2>
             <ul className="space-y-2">
               {proveedores.map((p, i) => (
                 <li key={i} className="border rounded border-white/20 p-3 shadow bg-white/5 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{p.nombre} {p.apellido}</p>
                        <p className="text-sm text-gray-300">{p.mail}</p>
                    </div>
                    {/* Futuro espacio para botones de acción como Editar o Eliminar */}
                 </li>
               ))}
               {proveedores.length === 0 && (
                <p className="text-gray-400">Aún no hay proveedores agregados.</p>
               )}
             </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
