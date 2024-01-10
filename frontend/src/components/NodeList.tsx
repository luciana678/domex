import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { User } from '@/types'

type Props = {
  nodes: User[]
  sendDirectMessage: any
}

export default function NodeList({ nodes, sendDirectMessage }: Props) {
  return (
    <Card className='bg-white p-4 shadow-lg border border-gray-300 rounded-md min-w-[275]'>
      <CardContent>
        <h2 className='text-lg font-semibold text-center mb-3'>Nodos</h2>
        {nodes.map((node, index) => (
          <div key={index}>
            <Typography
              sx={{
                mb: 1,
              }}>
              {node.userName}
            </Typography>
            <button
              onClick={() => {
                sendDirectMessage(node.userID, 'Hello')
              }}>
              Send message
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
