'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext, useEffect } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import usePeers from './usePeers'

const useInitializePeers = () => {
  const { peers, clusterUsers } = useContext(RoomContext)
  const { addPeer, deletePeer } = usePeers()

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
    const onEventsOfPeer = (peer: SimplePeer.Instance, userID: UserID) => {
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
        deletePeer(userID)
        // delete peersRef.current[userID]
      }

      const handlePeerConnect = () => {
        console.log('Peer connected')
      }

      peer.on('connect', handlePeerConnect)

      peer.on('data', handleReceivingData(userID))

      peer.on('error', handlePeerError)

      peer.on('close', handlePeerClose)
    }

    const peersEntries = Object.entries(peers) as [UserID, SimplePeer.Instance][]

    peersEntries.forEach(([userID, peer]) => {
      return onEventsOfPeer(peer, userID)
    })

    return () => {
      peersEntries.forEach(([userID, peer]) => {
        peer.removeAllListeners()
      })
    }
  }, [clusterUsers, deletePeer, peers])
}

export default useInitializePeers
