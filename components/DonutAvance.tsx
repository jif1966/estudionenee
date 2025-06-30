'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type DonutAvanceProps = {
  porcentaje: number
  size?: number
}

const COLORS = ['#3b82f6', '#e5e7eb']

export default function DonutAvance({ porcentaje, size = 80 }: DonutAvanceProps) {
  const data = [
    { name: 'Avance', value: porcentaje },
    { name: 'Faltante', value: 100 - porcentaje },
  ]

  return (
    <div
      className="relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={size * 0.5 - 15}
            outerRadius={size * 0.5}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-sm">
        {porcentaje}%
      </div>
    </div>
  )
}
