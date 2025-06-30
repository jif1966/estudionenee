// components/ui/select.tsx

// --- VERSIÓN 3: AHORA ACEPTA 'className' PARA ESTILOS ---

import React from 'react';

export function Select({ children, value, onValueChange }: {
  children: React.ReactNode;
  value: any;
  onValueChange: (value: any) => void;
}) {
  return <select value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder || 'Seleccionar...'}</option>;
}

// A SelectTrigger le enseñamos a recibir "className"
export function SelectTrigger({ children, className }: {
  children: React.ReactNode;
  className?: string; // <-- AÑADIDO
}) {
  // Y se lo pasamos al div para que aplique el estilo
  return <div className={className}>{children}</div>; // <-- AÑADIDO
}

// Hacemos lo mismo para SelectContent por si acaso también lo necesita
export function SelectContent({ children, className }: {
  children: React.ReactNode;
  className?: string; // <-- AÑADIDO
}) {
  return <div className={className}>{children}</div>; // <-- AÑADIDO
}

export function SelectItem({ children, value }: { children: React.ReactNode, value: string }) {
  return <option value={value}>{children}</option>;
}