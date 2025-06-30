'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CostosProyectoPage() {
  const [material, setMaterial] = useState('');
  const [costo, setCosto] = useState('');
  const [items, setItems] = useState<{ material: string; costo: number }[]>([]);

  const agregarItem = () => {
    if (material && costo) {
      setItems([...items, { material, costo: parseFloat(costo) }]);
      setMaterial('');
      setCosto('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Costos del Proyecto</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Material o ítem"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
        <Input
          placeholder="Costo en ARS"
          type="number"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
        />
        <Button onClick={agregarItem}>Agregar</Button>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="border p-2 rounded bg-white shadow-sm">
            {item.material}: ${item.costo.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
