import Sidebar from "@/components/Sidebar"; // Asumo que Sidebar también es una exportación nombrada
import { Header } from "@/components/Header"; // ¡CORREGIDO!
import { useState } from "react";

interface Cliente {
  nombre: string;
  apellido: string;
  mail: string;
  telefono: string;
  direccion: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevo, setNuevo] = useState<Cliente>({
    nombre: "", apellido: "", mail: "", telefono: "", direccion: ""
  });

  const agregarCliente = () => {
    setClientes([...clientes, nuevo]);
    setNuevo({ nombre: "", apellido: "", mail: "", telefono: "", direccion: "" });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full">
        <Header title="Clientes" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Apellido" value={nuevo.apellido} onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Correo" value={nuevo.mail} onChange={(e) => setNuevo({ ...nuevo, mail: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Teléfono" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
            <input className="border p-2 rounded col-span-2" placeholder="Dirección" value={nuevo.direccion} onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })} />
          </div>
          <button onClick={agregarCliente} className="bg-green-600 text-white px-4 py-2 rounded">Agregar cliente</button>
          <ul className="mt-4 space-y-2">
            {clientes.map((c, i) => (
              <li key={i} className="border rounded p-2 shadow bg-white/70">{c.nombre} {c.apellido} – {c.mail}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
