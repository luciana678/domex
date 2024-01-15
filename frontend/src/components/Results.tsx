'use client'

import { DataGrid, GridColDef } from '@mui/x-data-grid'

export default function Results({ className, data }: { className: string; data: any[] }) {
  const columns: GridColDef[] = [
    {
      field: 'key',
      headerName: 'CLAVE',
      headerAlign: 'center',
      flex: 1,
    },
    {
      field: 'value',
      headerName: 'VALOR',
      headerAlign: 'center',
      flex: 1,
    },
  ]

  const rows = data.map((row, index) => {
    return {
      id: index,
      key: row.key,
      value: row.value,
    }
  })

  return (
    <div className={`bg-white p-4 shadow-lg border border-gray-300 rounded-md ${className}`}>
      <h2 className='text-lg font-semibold text-center mb-3'>Resultados</h2>
      <DataGrid
        columns={columns}
        rows={rows}
        disableColumnMenu
        showColumnVerticalBorder
        showCellVerticalBorder
      />
    </div>
  )
}
