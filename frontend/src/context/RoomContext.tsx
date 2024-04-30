'use client'

import { type Peers, type RoomSession, type User } from '@/types'
import React, { PropsWithChildren, createContext, useMemo, useState } from 'react'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
  roomOwner: User | null
  isReadyToExecute: boolean
  setIsReadyToExecute: React.Dispatch<React.SetStateAction<boolean>>
}

const RoomContext = createContext<RoomContextType>({
  clusterUsers: [],
  setClusterUsers: () => {},
  roomSession: null,
  setRoomSession: () => {},
  peers: {},
  setPeers: () => {},
  roomOwner: null,
  isReadyToExecute: false,
  setIsReadyToExecute: () => {},
})

export const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clusterUsers, setClusterUsers] = useState<User[]>([])
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const [peers, setPeers] = useState<Peers>({})
  const [isReadyToExecute, setIsReadyToExecute] = useState(false)

  const roomOwner = useMemo(
    () => clusterUsers.find((user) => user.isRoomOwner) || null,
    [clusterUsers],
  )

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
        isReadyToExecute,
        setIsReadyToExecute,
      }}>
      {children}
    </RoomContext.Provider>
  )
}

export default RoomContext
