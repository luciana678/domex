'use client'

import { type Peers, type RoomSession, type User } from '@/types'
import React, { PropsWithChildren, createContext, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
  roomOwner: User | null
  setRoomOwner: React.Dispatch<React.SetStateAction<User | null>>
  ownerPeer: SimplePeer.Instance | null
  setOwnerPeer: React.Dispatch<React.SetStateAction<SimplePeer.Instance | null>>
  // isRoomOwner: boolean
  // setIsRoomOwner: React.Dispatch<React.SetStateAction<boolean>>
}

const RoomContext = createContext<RoomContextType>({
  clusterUsers: [],
  setClusterUsers: () => {},
  roomSession: null,
  setRoomSession: () => {},
  peers: {},
  setPeers: () => {},
  roomOwner: null,
  setRoomOwner: () => {},
  ownerPeer: null,
  setOwnerPeer: () => {},
  // isRoomOwner: false,
  // setIsRoomOwner: () => {},
})

export const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clusterUsers, setClusterUsers] = useState<User[]>([])
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const [peers, setPeers] = useState<Peers>({})
  const [roomOwner, setRoomOwner] = useState<User | null>(null)
  const [ownerPeer, setOwnerPeer] = useState<SimplePeer.Instance | null>(null)
  // const [isRoomOwner, setIsRoomOwner] = useState<boolean>(false)

  return (
    <RoomContext.Provider
      value={{
        clusterUsers,
        setClusterUsers,
        roomSession,
        setRoomSession,
        peers,
        setPeers,
        roomOwner,
        setRoomOwner,
        ownerPeer,
        setOwnerPeer,
        // isRoomOwner,
        // setIsRoomOwner,
      }}>
      {children}
    </RoomContext.Provider>
  )
}

export default RoomContext
