import Image from 'next/image';
import React from 'react'; // Es una buena práctica importar React

// 1. Definimos un "contrato" explícito para las propiedades del Header.
//    Esto le dice a TypeScript: "Este componente DEBE recibir un 'title' que sea texto".
interface HeaderProps {
  title: string;
}

// 2. Le decimos a la función que sus propiedades ("props") deben seguir ese contrato.
//    Usamos { title } para extraer directamente la propiedad que nos interesa.
export function Header({ title }: HeaderProps) {
  return (
    <header className="w-full flex justify-between items-center p-4 border-b bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Estudio Nenee" width={40} height={40} />
        {/* 3. Usamos la propiedad "title" en lugar de un texto fijo */}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <span className="text-sm text-muted-foreground">Sistema de Gestión</span>
    </header>
  );
}