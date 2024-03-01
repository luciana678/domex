'use client'

import { Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

export default function Results({ className, data }: { className: string; data: {} }) {
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

  const rows = Object.entries(data).map(([key, value], index) => {
    return {
      id: index,
      key: key,
      value: String(value),
    }
  })

  return (
    <div className={`bg-white p-4 shadow-lg border border-gray-300 rounded-md ${className}`}>
      <Typography variant='h4' component='div' className='text-center mb-3'>
        Resultados
      </Typography>
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
