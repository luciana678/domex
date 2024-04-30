'use client'

import { KeyValue, KeyValues } from '@/types'
import { Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

export default function Results({
  title,
  className,
  data,
}: {
  title: string
  className?: string
  data: KeyValue | KeyValues
}) {
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
    <div
      className={`bg-white p-4 shadow-lg border border-gray-300 rounded-md w-full mt-5 ${className}`}>
      <Typography variant='h4' component='div' className='text-center mb-3'>
        {title}
      </Typography>
      <DataGrid
        className={`w-full ${rows.length > 0 ? 'h-auto' : 'h-36'}`}
        columns={columns}
        rows={rows}
        disableColumnMenu
        showColumnVerticalBorder
        showCellVerticalBorder
      />
    </div>
  )
}
