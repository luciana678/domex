'use client'

import Master from '@/app/master/page'
import Slave from '@/components/Slave'
import useInitializeRoom from '@/hooks/useInitializeRoom'
import useRoom from '@/hooks/useRoom'
import { Button } from '@mui/material'

function Room({ params: { id } }: { params: { id: string } }) {
  useInitializeRoom()

  return (
    <div>
      {/* <p>Room id {id}</p>
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
      
      <Slave roomProps={roomProps} />
    */}
      <Master />
    </div>
  )
}

export default Room
