'use client'

import Master from '@/components/Master'
import Slave from '@/components/Slave'
import useInitializeRoom from '@/hooks/useInitializeRoom'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { Button } from '@mui/material'

function Room() {
  useInitializeRoom()
  const { roomSession } = useRoom()

  return roomSession?.isRoomOwner ? <Master /> : <Slave />
}

export default Room
