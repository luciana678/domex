'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { Peers, RoomID, RoomSession, SessionID, BaseUser, UserID, User } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'
import useInitializePeers from './useInitializePeers'
import usePeers from './usePeers'
import useRoom from './useRoom'
import { toast } from 'sonner'
import useAlertModal from './useAlertModal'

const useInitializeRoom = () => {
  useInitializePeers()
  const { clusterUsers, setClusterUsers, setRoomSession, setPeers, roomOwner } =
    useContext(RoomContext)
  const router = useRouter()
  const pathname = usePathname()
  const { deletePeer, createPeer, broadcastMessage } = usePeers()
  const { leaveRoom } = useRoom()
  const { showConfirmAlert } = useAlertModal()

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
      isRoomOwner,
    }: {
      sessionID: SessionID
      userID: UserID
      roomID: RoomID
      userName: string
      isRoomOwner: boolean
    }) => {
      const session: RoomSession = { sessionID, roomID, userName, isRoomOwner }
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

    const onUsers = (baseUsers: BaseUser[]) => {
      const updatedUsers: User[] = baseUsers.map((user) => ({
        ...user,
        readyToExecuteMap: false,
        executionStatus: '',
      }))
      setClusterUsers(updatedUsers)

      const peers = baseUsers.reduce<Peers>((peers, user) => {
        const peer = createPeer(user.userID, socket.userID)
        return { ...peers, [user.userID]: peer }
      }, {})

      setPeers(peers)
    }

    const handleOwnerLeave = async () => {
      showConfirmAlert({
        title: 'El dueño abandonó la sala',
        description: 'La sala ha sido cerrada por el dueño, se le redirigirá a la página principal',
        confirmButtonText: 'De acuerdo',
        onConfirm() {
          leaveRoom()
        },
      })
    }

    const onUserLeave = ({ userID, userName }: { userID: UserID; userName: string }) => {
      const isOwner = roomOwner?.userID === userID

      if (isOwner) {
        return handleOwnerLeave()
      }

      // A user has left, remove it from the list
      const user = clusterUsers.find((user) => user.userID === userID)
      if (user?.readyToExecuteMap) {
        broadcastMessage({ type: 'RESET_READY_TO_EXECUTE' })
      }
      setClusterUsers((prevUsers) => prevUsers.filter((user) => user.userID !== userID))
      deletePeer(userID)

      toast.info(`${userName} ha abandonado la sala`)
    }

    const onUserDisconnected = ({ userID, userName }: { userID: UserID; userName: string }) => {
      if (socket.userID === userID) return

      // A user/owner has disconnected, update the connected status
      setClusterUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.userID === userID) {
            return { ...user, socketConnected: false }
          }
          return user
        }),
      )

      toast.error(`${userName} se ha desconectado de la sala`)
      // deletePeer(userID)
    }

    const onUserConnected = ({
      userID,
      userName,
      socketConnected,
      isRoomOwner,
    }: {
      userID: UserID
      userName: string
      socketConnected: boolean
      isRoomOwner: boolean
    }) => {
      // If the user is already in the list, update the connected status, otherwise add it to the list
      if (clusterUsers.some((user) => user.userID === userID)) {
        setClusterUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.userID === userID) {
              return { ...user, socketConnected }
            }
            return user
          }),
        )
        toast.success(`${userName} se ha reconectado a la sala`)
      } else {
        toast.success(`${userName} se ha unido a la sala`)
        setClusterUsers((prevUsers) => [
          ...prevUsers,
          {
            userID,
            userName,
            socketConnected,
            isRoomOwner,
            readyToExecuteMap: false,
            executionStatus: '',
          },
        ])
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

      // TODO: Manage better the error messages UI
      if (err.message === 'Room does not exist') {
        console.error('Room does not exist')
        sessionStorage.removeItem('session')

        if (pathname !== '/') {
          router.push('/')
        }

        toast.error('La sala a la que intenta acceder NO EXISTE', {
          position: 'top-center',
        })
      }

      if (err.message === 'Room is locked') {
        console.error('Room is locked')
        sessionStorage.removeItem('session')

        if (pathname !== '/') {
          router.push('/')
        }

        toast.error('La sala a la que intenta acceder está BLOQUEADA', {
          position: 'top-center',
        })
      }
    }

    socket.on('room:session', onSession)
    socket.on('room:users', onUsers)
    socket.on('room:user-connected', onUserConnected)
    socket.on('room:user-leave', onUserLeave)
    socket.on('room:user-disconnected', onUserDisconnected)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('room:session', onSession)
      socket.off('room:users', onUsers)
      socket.off('room:user-connected', onUserConnected)
      socket.off('room:user-leave', onUserLeave)
      socket.off('room:user-disconnected', onUserDisconnected)
      socket.off('connect_error', onConnectError)
    }
  }, [
    clusterUsers,
    createPeer,
    deletePeer,
    leaveRoom,
    pathname,
    roomOwner?.userID,
    router,
    setClusterUsers,
    setPeers,
    setRoomSession,
    broadcastMessage,
    showConfirmAlert,
  ])
}

export default useInitializeRoom
