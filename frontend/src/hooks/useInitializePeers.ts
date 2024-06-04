'use client'

import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext, useEffect, useRef } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import usePeers from './usePeers'
import useMapReduce from './useMapReduce'
import { Action } from '@/context/MapReduceContext'
import { handleActionSignal } from '@/utils/handleActions'
import useFiles from './useFiles'
import { ENVS } from '@/constants/envs'

const CHUNK_SIZE = ENVS.GENERAL.CHUNK_SIZE

const useInitializePeers = () => {
  const { peers, setPeers, setClusterUsers, clusterUsers } = useContext(RoomContext)
  const { addPeer, deletePeer } = usePeers()
  const { dispatchMapReduce } = useMapReduce()
  const { handleReceivingFiles } = useFiles()

  const fileNamesRef = useRef<{ [uuid: string]: string }>({})
  const fileChunksRef = useRef<{ [uuid: string]: Buffer[] }>({})
  const messageChunksRef = useRef<{ [userID: UserID]: { totalChunks: number; chunks: Buffer[] } }>(
    {},
  )

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
        const headerEndIndex = data.indexOf('}') + 1
        const chunkHeader = JSON.parse(data.subarray(0, headerEndIndex).toString('utf8'))
        const chunkData = data.subarray(headerEndIndex)

        if (chunkHeader.type === 'MSG_CHUNK') {
          if (!messageChunksRef.current[userID]) {
            messageChunksRef.current[userID] = { totalChunks: chunkHeader.totalChunks, chunks: [] }
          }

          messageChunksRef.current[userID].chunks[chunkHeader.chunkIndex] = chunkData

          const { totalChunks, chunks } = messageChunksRef.current[userID]
          if (chunks.filter((chunk) => chunk !== undefined).length === totalChunks) {
            const completeMessage = Buffer.concat(chunks)
            delete messageChunksRef.current[userID]

            try {
              const decodedData: Action = JSON.parse(completeMessage.toString('utf8'))

              if (decodedData.type === 'FILE_NAME') {
                const { uuid, name } = decodedData.payload
                fileNamesRef.current[uuid] = name
                fileChunksRef.current[uuid] = []
                return
              }

              decodedData['userID'] = userID
              decodedData['userName'] = clusterUsers.find((user) => user.userID === userID)
                ?.userName
              handleActionSignal({ action: decodedData, setClusterUsers })
              dispatchMapReduce(decodedData)
              handleReceivingFiles(decodedData)
            } catch (err) {
              console.error('Error parsing complete message:', err)
            }
          }
        } else if (chunkHeader.type === 'FILE_CHUNK') {
          const { uuid, chunkIndex, totalChunks } = chunkHeader

          if (!fileChunksRef.current[uuid]) {
            fileChunksRef.current[uuid] = []
          }

          fileChunksRef.current[uuid][chunkIndex] = chunkData

          if (
            fileChunksRef.current[uuid].filter((chunk) => chunk !== undefined).length ===
            totalChunks
          ) {
            const completeFileBuffer = Buffer.concat(fileChunksRef.current[uuid])
            const fileName = fileNamesRef.current[uuid]
            const file = new File([completeFileBuffer], fileName)
            const action: Action = { type: 'ADD_FILES', payload: [file] }
            handleReceivingFiles(action)
            delete fileChunksRef.current[uuid]
            delete fileNamesRef.current[uuid]
          }
        } else {
          console.error('Received unknown data type:', chunkHeader.type)
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
