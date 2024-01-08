'use client'

import { type Peers, type RoomSession, type User } from '@/types'
import React, { PropsWithChildren, createContext, useRef, useState } from 'react'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
}

const RoomContext = createContext<RoomContextType>({
  clusterUsers: [],
  setClusterUsers: () => {},
  roomSession: null,
  setRoomSession: () => {},
  peers: {},
  setPeers: () => {},
})

export const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clusterUsers, setClusterUsers] = useState<User[]>([])
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const [peers, setPeers] = useState<Peers>({})

  return (
    <RoomContext.Provider
      value={{
        clusterUsers,
        setClusterUsers,
        roomSession,
        setRoomSession,
        peers,
        setPeers,
      }}>
      {children}
    </RoomContext.Provider>
  )
}

export default RoomContext
