'use client'

import useRoom from '@/hooks/useRoom'
import { Button } from '@mui/material'

function Room({ params: { id } }: { params: { id: string } }) {
  const { roomSession, leaveRoom, clusterUsers, sendDirectMessage } = useRoom()

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

      <p>Users in this room:</p>
      {JSON.stringify(clusterUsers)}
      <ul>
        {clusterUsers.map((user) => (
          <div key={user.userID}>
            <li>{user.userName}</li>
            <button
              onClick={() => {
                sendDirectMessage(user.userID, 'Hello')
              }}>
              Send message
            </button>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default Room
