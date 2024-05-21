'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect } from 'react'
import usePeers from '@/hooks/usePeers'
import useMapReduce from '@/hooks/useMapReduce'

type ClusterAuthProps = {
  userName: string
  roomID?: RoomID
  creatingCluster: boolean
}

const useRoom = () => {
  const router = useRouter()
  const {
    clusterUsers,
    roomSession,
    roomOwner,
    isReadyToExecute,
    setIsReadyToExecute,
    setRoomSession,
  } = useContext(RoomContext)
  const { destroyPeers } = usePeers()

  const { dispatchMapReduce } = useMapReduce()

  const joinCluster = useCallback((auth: ClusterAuthProps) => {
    socket.auth = auth
    socket.connect()
  }, [])

  const toggleRoomLock = useCallback((lock: boolean) => socket.emit('room:toggle-lock', lock), [])

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave-room')
    sessionStorage.clear()
    socket.disconnect()
    setRoomSession(null)
    destroyPeers()
    router.push('/')
    dispatchMapReduce({ type: 'RESET_READY_TO_EXECUTE' })
  }, [destroyPeers, dispatchMapReduce, router, setRoomSession])

  // TODO: If this will be used, we need to solve the issue of peers reconnections, or remove this and solve the inconsistency of states when the user refreshes the page while is executing a map-reduce job
  // useEffect(() => {
  //   return () => window.addEventListener('beforeunload', (_) => leaveRoom())
  // }, [leaveRoom])

  return {
    clusterUsers,
    roomSession,
    joinCluster,
    leaveRoom,
    roomOwner,
    isReadyToExecute,
    setIsReadyToExecute,
    toggleRoomLock,
  }
}

export default useRoom
