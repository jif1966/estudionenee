// components/ui/checkbox.tsx

import React from 'react';

// 1. Definimos un "contrato" claro para las propiedades (props)
//    que nuestro componente Checkbox puede aceptar.
interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  // También agregamos la posibilidad de que acepte otras props de HTML
  [key: string]: any; 
}

// 2. Le decimos a la función que debe recibir esas props.
export function Checkbox({ id, checked, onCheckedChange, ...props }: CheckboxProps) {
  
  // 3. Creamos una función para manejar el evento 'onChange' del input real
  //    y llamar a nuestra función 'onCheckedChange' con el nuevo valor.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked);
  };

  // 4. Devolvemos un input de tipo checkbox real, pasándole todas las propiedades.
  //    Le agregamos un poco de estilo con Tailwind para que se vea bien.
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={handleChange}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      {...props} // Pasamos cualquier otra prop extra
    />
  );
}