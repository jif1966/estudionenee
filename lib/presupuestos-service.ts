// lib/presupuestos-service.ts
import { supabase } from './supabase';

// Función para obtener TODOS los presupuestos
export const getPresupuestos = async () => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('created_at', { ascending: false });

  // Si hay un error, lo lanzamos para que el componente lo atrape
  if (error) throw new Error(error.message);
  // Si no hay datos, devolvemos un array vacío
  return data || [];
};

// Puedes añadir más funciones aquí en el futuro, como:
// export const getPresupuestoById = async (id) => { ... }
// export const deletePresupuesto = async (id) => { ... }