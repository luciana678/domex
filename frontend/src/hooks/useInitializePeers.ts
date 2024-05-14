'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext, useEffect, useState } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import usePeers from './usePeers'
import useMapReduce from './useMapReduce'
import { Action } from '@/context/MapReduceContext'
import { handleActionSignal } from '@/utils/handleActions'
import useFiles from './useFiles'

const useInitializePeers = () => {
  const { peers, setPeers, setClusterUsers, clusterUsers } = useContext(RoomContext)
  const { addPeer, deletePeer } = usePeers()
  const { dispatchMapReduce } = useMapReduce()
  const { handleReceivingFiles } = useFiles()

  const [fileNames, setFileNames] = useState<string[]>([])

  useEffect(() => {
    const onWebRTCUserJoined = (payload: { signal: SignalData; callerID: UserID }) => {
      const peer = addPeer(payload.signal, payload.callerID)
      setPeers((peers) => ({ ...peers, [payload.callerID]: peer }))
      dispatchMapReduce({ type: 'RESET_READY_TO_EXECUTE' })
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
  }, [addPeer, dispatchMapReduce, peers, setPeers])

  const onEventsOfPeer = useCallback(
    (peer: SimplePeer.Instance, userID: UserID) => {
      const handleReceivingData = (userID: UserID) => (data: Buffer) => {
        try {
          const decodedData: Action = JSON.parse(data.toString('utf8'))
          if (decodedData.type === 'FILE_NAME') {
            setFileNames((fileNames) => [...fileNames, decodedData.payload])
            return
          }
          decodedData['userID'] = userID
          decodedData['userName'] = clusterUsers.find((user) => user.userID === userID)?.userName
          handleActionSignal({ action: decodedData, setClusterUsers })
          dispatchMapReduce(decodedData)
          handleReceivingFiles(decodedData)
        } catch (err) {
          // If the data is not a JSON, it is a file buffer: Breaks when trying to parse it to string
          setFileNames((fileNames) => {
            const [name, ...rest] = fileNames
            const fileData = data as ArrayBuffer
            const file = new File([fileData], name as string)
            const action: Action = { type: 'ADD_FILES', payload: [file] }
            name && handleReceivingFiles(action)
            return [...rest]
          })
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deletePeer, dispatchMapReduce, handleReceivingFiles, setClusterUsers],
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
