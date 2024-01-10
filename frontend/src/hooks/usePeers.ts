import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'

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

      if (peer) {
        peer.send(data)
      }
    },
    [peers],
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

      setPeers((peers) => ({ ...peers, [userToSignal]: peer }))

      return peer
    },
    [setPeers],
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

      setPeers((peers) => ({ ...peers, [callerID]: peer }))

      return peer
    },
    [setPeers],
  )

  return { deletePeer, sendDirectMessage, createPeer, destroyPeers, addPeer }
}

export default usePeers
