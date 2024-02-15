'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useContext } from 'react'
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

  return { clusterUsers, roomSession, connectRoom, leaveRoom, state, roomOwner }
}

export default useRoom
