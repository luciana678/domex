import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import { getIceServers } from '@/utils/iceServers'

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

      peer.send(JSON.stringify(data))

      return payloadSize
    },
    [peers],
  )

  const broadcastMessage = useCallback(
    (data: any) => {
      Object.values(peers).forEach((peer) => {
        peer.send(JSON.stringify(data))
      })
    },
    [peers],
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
  }
}

export default usePeers
