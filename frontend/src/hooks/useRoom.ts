'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect } from 'react'
import usePeers from '@/hooks/usePeers'
import useMapReduce from '@/hooks/useMapReduce'

const useRoom = () => {
  const router = useRouter()
  const { clusterUsers, roomSession, roomOwner, isReadyToExecute, setIsReadyToExecute } =
    useContext(RoomContext)
  const { destroyPeers } = usePeers()

  const { dispatchMapReduce } = useMapReduce()

  const connectRoom = useCallback((auth: { userName?: string; roomID?: RoomID }) => {
    socket.auth = auth
    socket.connect()
  }, [])

  const toggleRoomLock = useCallback((lock: boolean) => socket.emit('room:toggle-lock', lock), [])

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave-room')
    sessionStorage.clear()
    socket.disconnect()
    destroyPeers()
    router.push('/')
    dispatchMapReduce({ type: 'RESET_READY_TO_EXECUTE' })
  }, [destroyPeers, dispatchMapReduce, router])

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
    toggleRoomLock,
  }
}

export default useRoom
