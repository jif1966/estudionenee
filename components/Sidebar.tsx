// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import React from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Presupuestos', href: '/presupuestos' },
  { name: 'Proyectos', href: '/proyectos' }, // <-- ETIQUETA ACTUALIZADA
  { name: 'Contabilidad', href: '/contabilidad' },
  { name: 'Administración', href: '/configuracion' },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  // El resto del componente no cambia...
  return (
    <aside className={`fixed top-0 left-0 z-40 h-full bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out w-64
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 flex justify-center items-center border-b" style={{ minHeight: '112px' }}>
        <Image 
          src="/logo.png" 
          alt="Logo Estudio Nenee" 
          width={100} 
          height={100}
        />
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-3 my-1 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200
                  ${pathname === item.href ? 'bg-gray-200 font-semibold' : ''}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button className="w-full p-2 rounded-lg text-left text-red-500 hover:bg-red-50">
            Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}