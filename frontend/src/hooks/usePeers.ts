import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { User, UserID } from '@/types'
import { useCallback, useContext, useEffect } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'

const usePeers = () => {
  const { peersRef, clusterUsers, roomSession } = useContext(RoomContext)

  const detroyPeers = useCallback(() => {
    const peers = Object.values(peersRef.current) as SimplePeer.Instance[]

    peers.forEach((peer) => {
      peer.destroy()
    })

    peersRef.current = {}
  }, [peersRef])

  const deletePeer = useCallback(
    (userID: UserID) => {
      peersRef.current[userID]?.destroy()
      delete peersRef.current[userID]
    },
    [peersRef],
  )

  const sendDirectMessage = useCallback(
    (userID: UserID, data: any) => {
      const peer = peersRef.current[userID]

      if (peer) {
        peer.send(data)
      }
    },
    [peersRef],
  )

  useEffect(() => {
    console.log(roomSession?.userName, clusterUsers)
  }, [clusterUsers, roomSession?.userName])

  const onEventsOfPeer = useCallback(
    (peer: SimplePeer.Instance, userID: UserID) => {
      const handleReceivingData = (userID: UserID) => (data: Buffer) => {
        const decodedData = data.toString('utf8')
        // TODO: handle the data here (e.g. dispatch an action)
        const username = clusterUsers.find((user) => user.userID === userID)?.userName

        console.log('Data:', decodedData, 'from', username, 'with ID', userID)
      }

      const handlePeerError = (err: Error) => {
        console.error(err)
      }

      const handlePeerClose = () => {
        console.log('Peer closed')
        peer.destroy()
        // delete peersRef.current[userID]
      }

      const handlePeerConnect = () => {
        console.log('Peer connected')
      }

      peer.on('connect', handlePeerConnect)

      peer.on('data', handleReceivingData(userID))

      peer.on('error', handlePeerError)

      peer.on('close', handlePeerClose)

      return () => {
        peer.off('connect', handlePeerConnect)
        peer.off('data', handleReceivingData(userID))
        peer.off('error', handlePeerError)
        peer.off('close', handlePeerClose)
      }
    },
    [clusterUsers],
  )

  const createPeer = useCallback(
    (userToSignal: UserID, callerID: UserID) => {
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
      })

      peer.on('signal', (signal) => {
        socket.emit('webrtc:sending-signal', { userToSignal, callerID, signal })
      })

      // onEventsOfPeer(peer, userToSignal)

      peersRef.current[userToSignal] = peer

      return peer
    },
    [peersRef],
  )

  const addPeer = useCallback(
    (incomingSignal: SignalData, callerID: UserID) => {
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
      })

      peer.on('signal', (signal) => {
        socket.emit('webrtc:returning-signal', { signal, callerID })
      })

      peer.signal(incomingSignal)

      // onEventsOfPeer(peer, callerID)

      peersRef.current[callerID] = peer

      return peer
    },
    [peersRef],
  )

  useEffect(() => {
    const onWebRTCUserJoined = (payload: { signal: SignalData; callerID: UserID }) => {
      const peer = addPeer(payload.signal, payload.callerID)
    }

    const onWebRTCReceivingReturnedSignal = (payload: { signal: SignalData; userID: UserID }) => {
      const peer = peersRef.current[payload.userID]
      if (peer) {
        peer.signal(payload.signal)
      }
    }

    socket.on('webrtc:user-joined', onWebRTCUserJoined)
    socket.on('webrtc:receiving-returned-signal', onWebRTCReceivingReturnedSignal)

    const peers = Object.values(peersRef.current) as SimplePeer.Instance[]

    return () => {
      socket.off('webrtc:user-joined', onWebRTCUserJoined)
      socket.off('webrtc:receiving-returned-signal', onWebRTCReceivingReturnedSignal)

      peers.forEach((peer) => {
        peer.destroy()
      })
    }
  }, [addPeer, peersRef])

  useEffect(() => {
    const peers = Object.entries(peersRef.current) as [UserID, SimplePeer.Instance][]

    console.log(peers)

    const offFunctions = peers.map(([userID, peer]) => {
      return onEventsOfPeer(peer, userID)
    })

    return () => {
      peers.forEach(([userID, peer]) => {
        peer.destroy()
      })

      offFunctions.forEach((off) => off())
    }
  }, [onEventsOfPeer, peersRef])

  return { deletePeer, sendDirectMessage, createPeer, detroyPeers }
}

export default usePeers
