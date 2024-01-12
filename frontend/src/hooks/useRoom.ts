'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID, RoomSession, SessionID, User, UserID } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect } from 'react'
import usePeers from './usePeers'

const useRoom = () => {
  const router = useRouter()
  const { clusterUsers, roomSession, state, roomOwner } = useContext(RoomContext)
  const { destroyPeers } = usePeers()

  const connectRoom = useCallback((auth: { userName?: string; roomID?: RoomID }) => {
    socket.auth = auth
    socket.connect()
  }, [])

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave-room')
    sessionStorage.clear()
    socket.disconnect()
    destroyPeers()
    router.push('/')
  }, [destroyPeers, router])

  const getRoomOwner = useCallback(
    () =>
      Object.values(clusterUsers).find((user) => user.isRoomOwner || user.userName === '1') as User,
    [clusterUsers],
  )

  return { clusterUsers, roomSession, connectRoom, leaveRoom, state, getRoomOwner }
}

export default useRoom
