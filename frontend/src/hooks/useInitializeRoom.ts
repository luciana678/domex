'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { RoomID, RoomSession, SessionID, User, UserID } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'
import useInitializePeers from './useInitializePeers'
import usePeers from './usePeers'

const useInitializeRoom = () => {
  useInitializePeers()
  const { clusterUsers, setClusterUsers, setRoomSession } = useContext(RoomContext)
  const router = useRouter()
  const pathname = usePathname()
  const { deletePeer, createPeer } = usePeers()

  useEffect(() => {
    const session = sessionStorage.getItem('session')

    if (!session) {
      return router.push('/')
    }

    const parsedSession = JSON.parse(session)
    socket.auth = parsedSession
    socket.connect()

    return () => {
      // TODO: move the session to localStorage and clear the sessionStorage
      socket.disconnect()
    }
  }, [router])

  useEffect(() => {
    const onSession = ({
      sessionID,
      userID,
      roomID,
      userName,
    }: {
      sessionID: SessionID
      userID: UserID
      roomID: RoomID
      userName: string
    }) => {
      const session: RoomSession = { sessionID, roomID, userName }
      setRoomSession(session)
      // attach the session ID to the next reconnection attempts
      socket.auth = session
      // store it in the sessionStorage
      sessionStorage.setItem('session', JSON.stringify(session))
      // save the ID of the user
      socket.userID = userID
      // go to the room
      router.push(`/room/${roomID}`)
    }

    const onUsers = (users: User[]) => {
      setClusterUsers(users)

      users.forEach((user) => {
        const peer = createPeer(user.userID, socket.userID)
      })
    }

    const onUserLeave = ({ userID, userName }: { userID: UserID; userName: string }) => {
      // A user has left, remove it from the list
      setClusterUsers((prevUsers) => prevUsers.filter((user) => user.userID !== userID))
      deletePeer(userID)
    }

    const onUserDisconnected = ({ userID, userName }: { userID: UserID; userName: string }) => {
      if (socket.userID === userID) return

      // A user has disconnected, update the connected status
      setClusterUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.userID === userID) {
            return { ...user, connected: false }
          }
          return user
        }),
      )
      // deletePeer(userID)
    }

    const onUserConnected = ({
      userID,
      userName,
      connected,
    }: {
      userID: UserID
      userName: string
      connected: boolean
    }) => {
      // If the user is already in the list, update the connected status, otherwise add it to the list
      if (clusterUsers.some((user) => user.userID === userID)) {
        setClusterUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.userID === userID) {
              return { ...user, connected }
            }
            return user
          }),
        )
      } else {
        setClusterUsers((prevUsers) => [...prevUsers, { userID, userName, connected }])
      }
    }

    const onConnectError = (err: Error) => {
      if (err.message === 'missing username') {
        console.error('missing username')
        sessionStorage.removeItem('session')

        if (pathname !== '/') {
          router.push('/')
        }
      }
    }

    socket.on('room:session', onSession)
    socket.on('room:users', onUsers)
    socket.on('room:user-leave', onUserLeave)
    socket.on('room:user-disconnected', onUserDisconnected)
    socket.on('room:user-connected', onUserConnected)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('room:session', onSession)
      socket.off('room:users', onUsers)
      socket.off('room:user-leave', onUserLeave)
      socket.off('room:user-disconnected', onUserDisconnected)
      socket.off('room:user-connected', onUserConnected)
      socket.off('connect_error', onConnectError)
    }
  }, [clusterUsers, createPeer, deletePeer, pathname, router, setClusterUsers, setRoomSession])
}

export default useInitializeRoom
