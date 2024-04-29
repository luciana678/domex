'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect } from 'react'
import usePeers from './usePeers'

const useRoom = () => {
  const router = useRouter()
  const { clusterUsers, roomSession, roomOwner, isReadyToExecute, setIsReadyToExecute } =
    useContext(RoomContext)
  const { destroyPeers } = usePeers()

  const connectRoom = useCallback((auth: { userName?: string; roomID?: RoomID }) => {
    socket.auth = auth
    socket.connect()
  }, [])

  const lockRoom = useCallback(() => socket.emit('room:lock-room'), [])

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave-room')
    sessionStorage.clear()
    socket.disconnect()
    destroyPeers()
    router.push('/')
  }, [destroyPeers, router])

  // useEffect(() => {
  //   return () => window.addEventListener('beforeunload', (_) => leaveRoom())
  // }, [leaveRoom])

  return {
    clusterUsers,
    roomSession,
    connectRoom,
    leaveRoom,
    roomOwner,
    isReadyToExecute,
    setIsReadyToExecute,
    lockRoom,
  }
}

export default useRoom
