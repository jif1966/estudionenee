// components/Layout.tsx
'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Sidebar } from './Sidebar';

const MenuIcon = ({ className }: { className?: string }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const CloseIcon = ({ className }: { className?: string }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// ¡CORREGIDO! - La lista de fondos ahora está completa.
const fondos = [
  '/fondos/fondo1.jpg', '/fondos/fondo2.jpg', '/fondos/fondo3.jpg', 
  '/fondos/fondo4.jpg', '/fondos/fondo5.jpg', '/fondos/fondo6.jpg', 
  '/fondos/fondo7.jpg', '/fondos/fondo8.jpg', '/fondos/fondo9.jpg', 
  '/fondos/fondo10.jpg', '/fondos/fondo11.jpg', '/fondos/fondo12.jpg',
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [bgImage, setBgImage] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const cambiarFondo = () => {
      let nuevoIndice;
      const indiceActual = fondos.indexOf(bgImage);
      do {
        nuevoIndice = Math.floor(Math.random() * fondos.length);
      } while (fondos.length > 1 && nuevoIndice === indiceActual);
      setBgImage(fondos[nuevoIndice]);
    };
    cambiarFondo();
    const intervalo = setInterval(cambiarFondo, 60000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>
      
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className={`relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="sticky top-0 z-50 flex h-20 items-center px-4 sm:px-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <CloseIcon className="h-6 w-6"/> : <MenuIcon className="h-6 w-6"/>}
            </button>
        </header>

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}