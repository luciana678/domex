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

  const fileNamesRef = useRef<string[]>([])
  const fileChunksRef = useRef<{ [key: string]: Buffer[] }>({})
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
        if (data.toString().startsWith('{"type":"CHUNK"')) {
          const headerEndIndex = data.indexOf('}') + 1
          const chunkHeader = JSON.parse(data.slice(0, headerEndIndex).toString('utf8'))
          const chunkData = data.slice(headerEndIndex)

          if (!messageChunksRef.current[userID]) {
            messageChunksRef.current[userID] = { totalChunks: chunkHeader.totalChunks, chunks: [] }
          }

          messageChunksRef.current[userID].chunks[chunkHeader.chunkIndex] = chunkData

          const { totalChunks, chunks } = messageChunksRef.current[userID]
          if (chunks.length === totalChunks && chunks.every((chunk) => chunk !== undefined)) {
            const completeMessage = Buffer.concat(chunks)
            delete messageChunksRef.current[userID]

            try {
              const decodedData: Action = JSON.parse(completeMessage.toString('utf8'))

              if (decodedData.type === 'FILE_NAME') {
                fileNamesRef.current = [...fileNamesRef.current, decodedData.payload]
                fileChunksRef.current[decodedData.payload] = []
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
        } else if (fileNamesRef.current.length > 0) {
          const currentFileName = fileNamesRef.current[0]
          if (currentFileName) {
            fileChunksRef.current[currentFileName].push(data)
            if (data.byteLength < CHUNK_SIZE) {
              const fileBuffer = new Blob(fileChunksRef.current[currentFileName])
              const file = new File([fileBuffer], currentFileName)
              const action: Action = { type: 'ADD_FILES', payload: [file] }
              handleReceivingFiles(action)
              delete fileChunksRef.current[currentFileName]
              fileNamesRef.current = fileNamesRef.current.slice(1)
            }
          } else {
            console.error('Received binary data but no file name in the queue')
          }
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
