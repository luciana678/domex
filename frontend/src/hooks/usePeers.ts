import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { User, UserID } from '@/types'
import { useCallback, useContext, useEffect, useState } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'

const usePeers = () => {
  const { clusterUsers, roomSession, peers, setPeers } = useContext(RoomContext)

  const detroyPeers = useCallback(() => {
    console.log('ENTRO AL OTRO DESTROY')
    const peersValues = Object.values(peers)

    peersValues.forEach((peer) => {
      peer.destroy()
    })

    setPeers({})
  }, [peers, setPeers])

  const deletePeer = useCallback(
    (userID: UserID) => {
      // peers[userID]?.destroy()
      setPeers((peers) => {
        const newPeers = { ...peers }
        delete newPeers[userID]
        return newPeers
      })
    },
    [peers, setPeers],
  )

  const sendDirectMessage = useCallback(
    (userID: UserID, data: any) => {
      const peer = peers[userID]

      if (peer) {
        peer.send(data)
      }
    },
    [peers],
  )

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
        // peer.destroy()
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
      console.log('Creating peer')

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
      })

      peer.on('signal', (signal) => {
        socket.emit('webrtc:sending-signal', { userToSignal, callerID, signal })
      })

      setPeers((peers) => ({ ...peers, [userToSignal]: peer }))

      return peer
    },
    [setPeers],
  )

  const addPeer = useCallback(
    (incomingSignal: SignalData, callerID: UserID) => {
      console.log('Adding peer')
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
      })

      peer.on('signal', (signal) => {
        socket.emit('webrtc:returning-signal', { signal, callerID })
      })

      peer.signal(incomingSignal)

      setPeers((peers) => ({ ...peers, [callerID]: peer }))

      return peer
    },
    [setPeers],
  )

  useEffect(() => {
    const onWebRTCUserJoined = (payload: { signal: SignalData; callerID: UserID }) => {
      const peer = addPeer(payload.signal, payload.callerID)
    }

    const onWebRTCReceivingReturnedSignal = (payload: { signal: SignalData; userID: UserID }) => {
      const peer = peers[payload.userID]
      if (peer) {
        peer.signal(payload.signal)
      }
    }

    socket.on('webrtc:user-joined', onWebRTCUserJoined)
    socket.on('webrtc:receiving-returned-signal', onWebRTCReceivingReturnedSignal)

    return () => {
      socket.off('webrtc:user-joined', onWebRTCUserJoined)
      socket.off('webrtc:receiving-returned-signal', onWebRTCReceivingReturnedSignal)
    }
  }, [addPeer, peers])

  useEffect(() => {
    const peersEntries = Object.entries(peers) as [UserID, SimplePeer.Instance][]

    const offFunctions = peersEntries.map(([userID, peer]) => {
      return onEventsOfPeer(peer, userID)
    })

    return () => {
      // peers.forEach(([userID, peer]) => {
      //   peer.destroy()
      // })

      offFunctions.forEach((off) => off())
    }
  }, [onEventsOfPeer, peers])

  return { deletePeer, sendDirectMessage, createPeer, detroyPeers }
}

export default usePeers
