import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type Props = {
  nodes: string[]
}

export default function NodeList({ nodes }: Props) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography
          sx={{
            textAlign: 'center',
          }}>
          Nodos
        </Typography>
        {nodes.map((node, index) => (
          <Typography
            sx={{
              mb: 1,
            }}
            key={index}>
            {node}
          </Typography>
        ))}
      </CardContent>
    </Card>
  )
}
