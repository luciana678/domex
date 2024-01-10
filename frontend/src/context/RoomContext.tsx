'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { ReducerState, type Peers, type RoomSession, type User } from '@/types'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useRef,
  useState,
} from 'react'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
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
