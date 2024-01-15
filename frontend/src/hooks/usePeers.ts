import RoomContext from '@/context/RoomContext'
import { socket } from '@/socket'
import { UserID } from '@/types'
import { useCallback, useContext } from 'react'
import SimplePeer, { SignalData } from 'simple-peer'
import { getIceServers } from '@/utils/iceServers'

const usePeers = () => {
  const { peers, setPeers, roomOwner, ownerPeer, setOwnerPeer } = useContext(RoomContext)

  const destroyPeers = useCallback(() => {
    const peersValues = Object.values(peers)

    peersValues.forEach((peer) => {
      peer.destroy()
    })
    setPeers({})

    if (ownerPeer) {
      ownerPeer.destroy()
      setOwnerPeer(null)
    }
  }, [ownerPeer, peers, setOwnerPeer, setPeers])

  const deletePeer = useCallback(
    (userID: UserID) => {
      if (userID === roomOwner?.userID) {
        ownerPeer?.destroy()
        return setOwnerPeer(null)
      }

      peers[userID]?.destroy()
      setPeers((peers) => {
        const newPeers = { ...peers }
        delete newPeers[userID]
        return newPeers
      })
    },
    [ownerPeer, peers, roomOwner?.userID, setOwnerPeer, setPeers],
  )

  const sendDirectMessage = useCallback(
    (userID: UserID, data: any) => {
      const peer = roomOwner?.userID === userID ? ownerPeer : peers[userID]

      if (peer) {
        peer.send(JSON.stringify(data))
      }
    },
    [ownerPeer, peers, roomOwner?.userID],
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

  return { deletePeer, sendDirectMessage, createPeer, destroyPeers, addPeer, peers }
}

export default usePeers
