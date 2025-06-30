import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// 🔷 RESUMEN DETALLADO DE UN PROYECTO INDIVIDUAL
interface Proyecto {
  presupuesto: any
  gastos: any[]
  cobros: any[]
}

export function exportarResumenProyecto({ presupuesto, gastos, cobros }: Proyecto) {
  const fecha = new Date().toLocaleDateString('es-AR')
  const pdf = new jsPDF()

  pdf.setFontSize(14)
  pdf.text(`Resumen de Proyecto - ${presupuesto.cliente}`, 14, 20)
  pdf.setFontSize(10)
  pdf.text(`Dirección: ${presupuesto.direccion}`, 14, 28)
  pdf.text(`Fecha: ${fecha}`, 160, 28)

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalCobros = cobros.reduce((acc, c) => acc + Number(c.monto), 0)
  const saldo = (presupuesto.precio ?? 0) - totalGastos

  autoTable(pdf, {
    startY: 35,
    head: [['Monto presupuestado', 'Total cobrado', 'Total gastos', 'Saldo']],
    body: [[
      `$${presupuesto.precio}`,
      `$${totalCobros}`,
      `$${totalGastos}`,
      `$${saldo}`
    ]]
  })

  const adicionales = gastos.filter(g => g.categoria !== 'presupuesto')
  if (adicionales.length > 0) {
    // @ts-ignore
    pdf.text('Gastos adicionales no presupuestados:', 14, pdf.lastAutoTable.finalY + 10)
    autoTable(pdf, {
      // @ts-ignore
      startY: pdf.lastAutoTable.finalY + 15,
      head: [['Categoría', 'Descripción', 'Monto']],
      body: adicionales.map(g => [g.categoria, g.descripcion, `$${g.monto}`])
    })
  }

  pdf.save(`Resumen-${presupuesto.cliente}.pdf`)

  const wb = XLSX.utils.book_new()
  const resumen = [
    ['Monto presupuestado', presupuesto.precio],
    ['Total cobrado', totalCobros],
    ['Total gastos', totalGastos],
    ['Saldo', saldo]
  ]
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen)
  XLSX.utils.book_append_sheet(wb, hojaResumen, 'Resumen')

  if (adicionales.length > 0) {
    const hojaExtras = XLSX.utils.json_to_sheet(adicionales)
    XLSX.utils.book_append_sheet(wb, hojaExtras, 'Extras')
  }

  XLSX.writeFile(wb, `Resumen-${presupuesto.cliente}.xlsx`)
}

// 🔷 DASHBOARD GENERAL (TODOS LOS PROYECTOS EN EJECUCIÓN)
type ProyectoResumen = {
  id: string
  cliente: string
  descripcion: string
  precio: number
  totalCobrado: number
  totalGastado: number
  avance: number
}

export function exportarDashboardPDF(data: ProyectoResumen[]) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Resumen de Proyectos en Ejecución', 14, 20)

  const rows = data.map(p => [
    p.cliente,
    p.descripcion,
    `$${p.precio.toLocaleString()}`,
    `$${p.totalCobrado.toLocaleString()}`,
    `$${p.totalGastado.toLocaleString()}`,
    `${p.avance}%`
  ])

  autoTable(doc, {
    head: [['Cliente', 'Descripción', 'Precio', 'Cobrado', 'Gastado', 'Avance']],
    body: rows,
    startY: 30,
  })

  doc.save('dashboard_proyectos.pdf')
}

export function exportarDashboardExcel(data: ProyectoResumen[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(p => ({
      Cliente: p.cliente,
      Descripción: p.descripcion,
      Precio: p.precio,
      Cobrado: p.totalCobrado,
      Gastado: p.totalGastado,
      Avance: `${p.avance}%`
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proyectos')
  XLSX.writeFile(workbook, 'dashboard_proyectos.xlsx')
}
