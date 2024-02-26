import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import useRoom from '@/hooks/useRoom'
import usePeers from '@/hooks/usePeers'
import { getConnectionStatus, getExecutionStatus } from '@/utils/users'

export default function NodeList() {
  const { clusterUsers } = useRoom()
  const { sendDirectMessage, peers } = usePeers()

  return (
    <Card className='bg-white p-4 shadow-lg border border-gray-300 rounded-md min-w-[275]'>
      <CardContent>
        <h2 className='text-lg font-semibold text-center mb-3'>Nodos</h2>
        {clusterUsers.map((node, index) => (
          <div key={index}>
            <Typography
              sx={{
                mb: 1,
              }}>
              {node.userName} {getConnectionStatus(node)} {getExecutionStatus(node)}
            </Typography>
            <button
              onClick={() => {
                sendDirectMessage(node.userID, { data: 'Hello' })
              }}>
              Send message
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
