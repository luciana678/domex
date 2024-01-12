'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { ReducerState, type Peers, type RoomSession, type User } from '@/types'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from 'react'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
  roomOwner: User | null
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
  state: null,
  dispatch: () => {},
})

const initialState = {
  code: {
    mapCode: placeholdersFunctions.map.code,
    combinerCode: placeholdersFunctions.combiner.code,
    reduceCode: placeholdersFunctions.reduce.code,
  },
  combinerResults: {},
  reduceKeys: [],
  sendKeys: [],
  clavesRecibidas: {},
  receiveKeysFrom: [],
  resultadoFinal: {},
}

const actionTypes = {
  SET_CODES: 'SET_CODES',
  MAP_COMBINER_EJECUTADO: 'MAP_COMBINER_EJECUTADO',
  EJECUTAR_REDUCE: 'EJECUTAR_REDUCE',
  RECIBIR_CLAVES: 'RECIBIR_CLAVES',
  RESULTADO_FINAL: 'RESULTADO_FINAL',
} as const

type Action = {
  type: keyof typeof actionTypes
  userID: string
  payload: any
}

const reducer = (state: ReducerState, action: Action) => {
  switch (action.type) {
    case actionTypes.SET_CODES:
      return { ...state, code: action.payload }
    case actionTypes.MAP_COMBINER_EJECUTADO:
      const results = { ...state.combinerResults }
      results[action.userID] = action.payload.combinerResults
      return {
        ...state,
        combinerResults: results,
      }
    case actionTypes.EJECUTAR_REDUCE:
      return {
        ...state,
        reduceKeys: action.payload.reduceKeys,
        sendKeys: action.payload.sendKeys,
        receiveKeysFrom: action.payload.receiveKeysFrom,
      }
    case actionTypes.RECIBIR_CLAVES:
      const results2 = { ...state.clavesRecibidas }
      results2[action.userID] = action.payload

      return {
        ...state,
        clavesRecibidas: results2,
      }
    case actionTypes.RESULTADO_FINAL:
      return {
        ...state,
        resultadoFinal: { ...state.resultadoFinal, ...action.payload },
      }

    default:
      return state
  }
}

export const RoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clusterUsers, setClusterUsers] = useState<User[]>([])
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const [peers, setPeers] = useState<Peers>({})
  const [state, dispatch] = useReducer(reducer, initialState)

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
        state,
        dispatch,
      }}>
      {children}
    </RoomContext.Provider>
  )
}

export default RoomContext
