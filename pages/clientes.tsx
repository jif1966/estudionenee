'use client';

import { Sidebar } from "@/components/Sidebar"; // Corregido a minúsculas por consistencia
import { Header } from "@/components/Header"; 
import { useState } from "react";

// Se define la interfaz para un cliente
interface Cliente {
  nombre: string;
  apellido: string;
  mail: string;
  telefono: string;
  direccion: string;
}

export default function ClientesPage() {
  // --- ESTADO ---
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // Estado para el formulario de nuevo cliente
  const [nuevo, setNuevo] = useState<Cliente>({
    nombre: "", apellido: "", mail: "", telefono: "", direccion: ""
  });
  // Estado para controlar la visibilidad del Sidebar (¡ESTA ES LA CORRECCIÓN PRINCIPAL!)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- LÓGICA ---
  const agregarCliente = () => {
    // Validar que el nombre y apellido no estén vacíos
    if (!nuevo.nombre.trim() || !nuevo.apellido.trim()) {
        alert("El nombre y el apellido son obligatorios.");
        return;
    }
    // Añadir el nuevo cliente a la lista y limpiar el formulario
    setClientes([...clientes, nuevo]);
    setNuevo({ nombre: "", apellido: "", mail: "", telefono: "", direccion: "" });
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex text-white">
      {/* Se le pasa el estado 'isOpen' al Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      <main className="ml-64 p-6 w-full">
        <Header title="Clientes" />
        
        <div className="space-y-6 bg-black/20 backdrop-blur-md rounded-xl p-6">
          {/* Formulario para agregar clientes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400" placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400" placeholder="Apellido" value={nuevo.apellido} onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400" placeholder="Correo" value={nuevo.mail} onChange={(e) => setNuevo({ ...nuevo, mail: e.target.value })} />
              <input className="bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400" placeholder="Teléfono" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
              <input className="md:col-span-2 bg-white/10 border border-white/20 p-2 rounded placeholder-gray-400" placeholder="Dirección" value={nuevo.direccion} onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })} />
            </div>
            <button onClick={agregarCliente} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded">
              Agregar Cliente
            </button>
          </div>

          {/* Lista de clientes agregados */}
          <div className="pt-6 border-t border-white/20">
             <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
             <ul className="space-y-2">
               {clientes.map((c, i) => (
                 <li key={i} className="border rounded border-white/20 p-3 shadow bg-white/5 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{c.nombre} {c.apellido}</p>
                        <p className="text-sm text-gray-300">{c.mail}</p>
                    </div>
                 </li>
               ))}
             </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
