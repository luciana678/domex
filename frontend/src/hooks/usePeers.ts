import { ENVS } from '@/constants/envs'
import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { getIceServers } from '@/utils/iceServers'
import { useCallback, useContext } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import { v4 as uuidv4 } from 'uuid'

const CHUNK_SIZE = ENVS.GENERAL.CHUNK_SIZE

const usePeers = () => {
  const { peers, setPeers } = useContext(RoomContext)

  const destroyPeers = useCallback(() => {
    const peersValues = Object.values(peers)

    peersValues.forEach((peer) => {
      peer.destroy()
    })
    setPeers({})
  }, [peers, setPeers])

  const deletePeer = useCallback(
    (userID: UserID) => {
      peers[userID]?.destroy()
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
      if (!peer) return 0

      const payloadSize = data.payload ? Buffer.byteLength(JSON.stringify(data.payload)) : 0
      data.payloadSize = payloadSize

      const dataString = JSON.stringify(data)
      const dataBuffer = Buffer.from(dataString, 'utf8')

      const totalChunks = Math.ceil(dataBuffer.length / CHUNK_SIZE)

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = (i + 1) * CHUNK_SIZE
        const chunk = dataBuffer.subarray(start, end)
        const chunkHeader = JSON.stringify({ type: 'MSG_CHUNK', totalChunks, chunkIndex: i })
        peer.write(Buffer.concat([Buffer.from(chunkHeader), chunk]))
      }

      return payloadSize
    },
    [peers],
  )

  const sendFile = useCallback(
    async (userID: UserID, file: File) => {
      const peer = peers[userID]
      if (!peer) return

      const fileUUID = uuidv4()
      const fileNameMessage = {
        type: 'FILE_NAME',
        payload: { uuid: fileUUID, name: file.name },
      }

      sendDirectMessage(userID, fileNameMessage)

      const arrayBuffer = await file.arrayBuffer()
      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE)
      const fileBuffer = Buffer.from(arrayBuffer)

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = (i + 1) * CHUNK_SIZE
        const chunk = fileBuffer.subarray(start, end)
        const chunkHeader = JSON.stringify({
          type: 'FILE_CHUNK',
          uuid: fileUUID,
          chunkIndex: i,
          totalChunks,
        })
        peer.write(Buffer.concat([Buffer.from(chunkHeader, 'utf8'), chunk]))
      }

      console.log('File sent:', file.name, 'UUID:', fileUUID)
    },
    [peers, sendDirectMessage],
  )

  const broadcastMessage = useCallback(
    (data: any) => {
      Object.keys(peers).forEach((userID) => {
        sendDirectMessage(userID as UserID, data)
      })
    },
    [peers, sendDirectMessage],
  )

  const createPeer = useCallback((userToSignal: UserID, callerID: UserID) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: getIceServers(),
      },
    })

    peer.on('signal', (signal) => {
      socket.emit('webrtc:sending-signal', { userToSignal, callerID, signal })
    })

    return peer
  }, [])

  const addPeer = useCallback((incomingSignal: SignalData, callerID: UserID) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: getIceServers(),
      },
    })

    peer.on('signal', (signal) => {
      socket.emit('webrtc:returning-signal', { signal, callerID })
    })

    peer.signal(incomingSignal)

    return peer
  }, [])

  return {
    deletePeer,
    sendDirectMessage,
    createPeer,
    destroyPeers,
    addPeer,
    peers,
    broadcastMessage,
    sendFile,
  }
}

export default usePeers
