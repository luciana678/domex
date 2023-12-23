'use client'

import useRoom from '@/hooks/useRoom'
import { Button } from '@mui/material'

function Room({ params: { id } }: { params: { id: string } }) {
  const { roomSession, leaveRoom } = useRoom()

  const handleLeaveRoom = () => {
    leaveRoom()
  }

  return (
    <div>
      <p>Room id {id}</p>
      <p>{JSON.stringify(roomSession)}</p>
      <Button onClick={handleLeaveRoom} variant='contained' color='warning'>
        Leave
      </Button>
    </div>
  )
}

export default Room
