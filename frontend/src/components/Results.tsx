'use client'

import { KeyValue, KeyValues } from '@/types'
import { Typography } from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  GridFooter,
  useGridApiContext,
  esES,
} from '@mui/x-data-grid'

import Button from '@mui/material/Button'
import { createSvgIcon } from '@mui/material/utils'
import { Tooltip } from '@mui/joy'

const ExportIcon = createSvgIcon(
  <path d='M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z' />,
  'SaveAlt',
)

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
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        slots={{
          footer: function Footer() {
            const apiRef = useGridApiContext()
            return (
              <GridFooterContainer>
                <Tooltip title='Exportar datos a CSV'>
                  <Button
                    onClick={() => apiRef.current.exportDataAsCsv({ fileName: title })}
                    startIcon={<ExportIcon />}
                    sx={{ paddingLeft: 3 }}
                  />
                </Tooltip>
                <GridFooter />
              </GridFooterContainer>
            )
          },
        }}
      />
    </div>
  )
}
