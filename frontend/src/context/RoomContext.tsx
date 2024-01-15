'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { ReducerState, type Peers, type RoomSession, type User } from '@/types'
import React, { PropsWithChildren, createContext, useContext, useReducer, useState } from 'react'
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
  state: any
  dispatch: React.Dispatch<any>
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
  state: null,
  dispatch: () => {},
})

const initialState = {
  code: {
    mapCode: placeholdersFunctions.map.code,
    combinerCode: placeholdersFunctions.combiner.code,
    reduceCode: placeholdersFunctions.reduce.code,
  },
}

const actionTypes = {
  SET_CODES: 'SET_CODES',
} as const

type Action = {
  type: keyof typeof actionTypes
  payload: any
}

const reducer = (state: ReducerState, action: Action) => {
  switch (action.type) {
    case actionTypes.SET_CODES:
      return { ...state, code: action.payload }
    default:
      return state
  }
}

export const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clusterUsers, setClusterUsers] = useState<User[]>([])
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const [peers, setPeers] = useState<Peers>({})
  const [roomOwner, setRoomOwner] = useState<User | null>(null)
  const [ownerPeer, setOwnerPeer] = useState<SimplePeer.Instance | null>(null)
  const [state, dispatch] = useReducer(reducer, initialState)

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
        state,
        dispatch,
      }}>
      {children}
    </RoomContext.Provider>
  )
}

export default RoomContext

export const useRoomData = () => {
  const { state, dispatch } = useContext(RoomContext)

  return { state, dispatch }
}
