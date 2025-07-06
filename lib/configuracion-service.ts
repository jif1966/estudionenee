// lib/configuracion-service.ts
import { supabase } from './supabase';

// Función para obtener la configuración financiera actual
export const getConfiguracionFinanciera = async () => {
  const { data, error } = await supabase
    .from('configuracion_financiera')
    .select('*')
    .eq('id', 1) // Siempre trabajamos sobre la única fila que existe
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Función para actualizar el saldo inicial de la caja
export const updateSaldoInicial = async (nuevoSaldo: number) => {
    const { data, error } = await supabase
        .from('configuracion_financiera')
        .update({ saldo_inicial_caja: nuevoSaldo })
        .eq('id', 1)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};