'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext, useEffect } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import usePeers from './usePeers'
import useMapReduce from './useMapReduce'
import { Action, actionTypes } from '@/context/MapReduceContext'
import { handleActionSignal } from '@/utils/handleActions'
import useFiles from './useFiles'

const useInitializePeers = () => {
  const { peers, setPeers, setClusterUsers } = useContext(RoomContext)
  const { addPeer, deletePeer } = usePeers()
  const { dispatchMapReduce } = useMapReduce()
  const { handleReceivingFiles } = useFiles()

  useEffect(() => {
    const onWebRTCUserJoined = (payload: { signal: SignalData; callerID: UserID }) => {
      const peer = addPeer(payload.signal, payload.callerID)
      setPeers((peers) => ({ ...peers, [payload.callerID]: peer }))
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
  }, [addPeer, peers, setPeers])

  const onEventsOfPeer = useCallback(
    (peer: SimplePeer.Instance, userID: UserID) => {
      const handleReceivingData = (userID: UserID) => (data: Buffer) => {
        const decodedData: Action = JSON.parse(data.toString('utf8'))
        // TODO: handle the data here (e.g. dispatch an action)
        decodedData['userID'] = userID

        handleActionSignal({ action: decodedData, setClusterUsers })
        dispatchMapReduce(decodedData)
        handleReceivingFiles(decodedData)
      }

      const handlePeerError = (err: Error) => {
        console.error(err)
      }

      const handlePeerClose = () => {
        console.log('Peer closed')
        peer.destroy()
        deletePeer(userID)
        setClusterUsers((clusterUsers) =>
          clusterUsers.map((user) => {
            if (user.userID === userID) {
              return { ...user, peerConnected: false }
            }
            return user
          }),
        )
        // delete peersRef.current[userID]
      }

      const handlePeerConnect = () => {
        console.log('Peer connected')
        setClusterUsers((clusterUsers) =>
          clusterUsers.map((user) => {
            if (user.userID === userID) {
              return { ...user, peerConnected: true }
            }
            return user
          }),
        )
      }

      peer.on('connect', handlePeerConnect)

      peer.on('data', handleReceivingData(userID))

      peer.on('error', handlePeerError)

      peer.on('close', handlePeerClose)
    },
    [deletePeer, dispatchMapReduce, setClusterUsers],
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
}

export default useInitializePeers
