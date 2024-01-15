'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext, useEffect } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import usePeers from './usePeers'

const useInitializePeers = () => {
  const { peers, clusterUsers, setPeers, roomOwner, setOwnerPeer, ownerPeer, dispatch } =
    useContext(RoomContext)
  const { addPeer, deletePeer } = usePeers()

  useEffect(() => {
    const onWebRTCUserJoined = (payload: { signal: SignalData; callerID: UserID }) => {
      const peer = addPeer(payload.signal, payload.callerID)
      if (payload.callerID === roomOwner?.userID) {
        setOwnerPeer(peer)
      } else {
        setPeers((peers) => ({ ...peers, [payload.callerID]: peer }))
      }
    }

    const onWebRTCReceivingReturnedSignal = (payload: { signal: SignalData; userID: UserID }) => {
      const peer = roomOwner?.userID === payload.userID ? ownerPeer : peers[payload.userID]
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
  }, [addPeer, ownerPeer, peers, roomOwner?.userID, setOwnerPeer, setPeers])

  const onEventsOfPeer = useCallback(
    (peer: SimplePeer.Instance, userID: UserID) => {
      const handleReceivingData = (userID: UserID) => (data: Buffer) => {
        const decodedData = JSON.parse(data.toString('utf8'))
        // TODO: handle the data here (e.g. dispatch an action)
        let username
        if (userID === roomOwner?.userID) {
          username = roomOwner?.userName
        } else {
          username = clusterUsers.find((user) => user.userID === userID)?.userName
        }

        console.log('Data:', decodedData, 'from', username, 'with ID', userID)
        dispatch(decodedData)
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
    },
    [clusterUsers, deletePeer, dispatch, roomOwner],
  )

  useEffect(() => {
    // Set up the events for the user peers
    const peersEntries = Object.entries(peers) as [UserID, SimplePeer.Instance][]

    peersEntries.forEach(([userID, peer]) => {
      return onEventsOfPeer(peer, userID)
    })

    return () => {
      peersEntries.forEach(([userID, peer]) => {
        peer.removeAllListeners()
      })
    }
  }, [onEventsOfPeer, peers])

  useEffect(() => {
    // Set up the events for the owner peer
    if (ownerPeer && roomOwner?.userID) {
      onEventsOfPeer(ownerPeer, roomOwner.userID)
    }

    return () => {
      if (ownerPeer && roomOwner?.userID) {
        ownerPeer.removeAllListeners()
      }
    }
  }, [onEventsOfPeer, ownerPeer, roomOwner?.userID])
}

export default useInitializePeers
