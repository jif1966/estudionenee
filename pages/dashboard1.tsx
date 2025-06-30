'use client';

import React, { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts";
import { motion } from "framer-motion";

// --- Tipos de Datos para el Dashboard ---
// Esto define la "forma" de los datos que esperamos de nuestra función de Supabase
interface DashboardData {
  proyectosEnCurso: number;
  presupuestosActivos: number;
  pendienteDeCobro: number;
  totalGastado: number;
  estadosProyectos: { name: string; value: number }[];
  ingresosUltimos12Meses: { mes: string; ingreso: number }[];
}

// --- Componente Principal del Dashboard ---
export default function DashboardPage() {
  // --- Estados ---
  // Tres estados para una mejor experiencia de usuario
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de Datos ---
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        setLoading(true);
        // ¡UNA SOLA LLAMADA A LA BASE DE DATOS!
        const { data: dashboardData, error: rpcError } = await supabase.rpc('get_dashboard_stats');

        if (rpcError) {
          throw rpcError;
        }

        setData(dashboardData);
      } catch (err: any) {
        setError("No se pudieron cargar los datos del dashboard. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  // --- Funciones de Formato ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  // --- Lógica de Renderizado ---
  if (loading) {
    return <div className="p-6 text-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-center">No hay datos disponibles para mostrar.</div>;
  }

  // Tarjetas de Resumen (KPIs)
  const resumenKPIs = [
    { label: "Proyectos en curso", value: data.proyectosEnCurso, color: "#3b82f6" },
    { label: "Presupuestos activos", value: formatCurrency(data.presupuestosActivos), color: "#22c55e" },
    { label: "Pendiente de cobro", value: formatCurrency(data.pendienteDeCobro), color: "#eab308" },
    { label: "Total Gastado (Proy. en curso)", value: formatCurrency(data.totalGastado), color: "#f97316" },
  ];

  const coloresPie = ["#93c5fd", "#6ee7b7", "#fcd34d", "#fca5a5"];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
        Dashboard General
      </motion.h1>

      {/* Sección de Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {resumenKPIs.map((item) => (
          <Card key={item.label} className="shadow-lg border-l-4" style={{ borderColor: item.color }}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Gráfico de Distribución de Proyectos */}
        <Card className="p-4 shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Distribución de Proyectos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.estadosProyectos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {data.estadosProyectos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} proyectos`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Ingresos Mensuales */}
        <Card className="p-4 shadow-md lg:col-span-3">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Ingresos Mensuales (últimos 12 meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ingresosUltimos12Meses}>
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} fontSize={12} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="ingreso" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
