'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { ReducerState, UserID, type Peers, type RoomSession, type User } from '@/types'
import React, { PropsWithChildren, createContext, useMemo, useReducer, useState } from 'react'

export type RoomContextType = {
  clusterUsers: User[]
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
  roomSession: RoomSession | null
  setRoomSession: React.Dispatch<React.SetStateAction<RoomSession | null>>
  peers: Peers
  setPeers: React.Dispatch<React.SetStateAction<Peers>>
  roomOwner: User | null
  state: ReducerState
  dispatch: React.Dispatch<Action>
}

const initialState: ReducerState = {
  code: {
    mapCode: placeholdersFunctions.map.code,
    combinerCode: placeholdersFunctions.combiner.code,
    reduceCode: placeholdersFunctions.reduce.code,
  },
  combinerResults: {},
  reduceKeys: {},
  sendKeys: [] as unknown as ReducerState['sendKeys'],
  clavesRecibidas: {},
  receiveKeysFrom: null,
  resultadoFinal: {},
}

const RoomContext = createContext<RoomContextType>({
  clusterUsers: [],
  setClusterUsers: () => {},
  roomSession: null,
  setRoomSession: () => {},
  peers: {},
  setPeers: () => {},
  roomOwner: null,
  state: initialState,
  dispatch: () => {},
})

const actionTypes = {
  SET_CODES: 'SET_CODES',
  MAP_COMBINER_EJECUTADO: 'MAP_COMBINER_EJECUTADO',
  EJECUTAR_REDUCE: 'EJECUTAR_REDUCE',
  RECIBIR_CLAVES: 'RECIBIR_CLAVES',
  RESULTADO_FINAL: 'RESULTADO_FINAL',
} as const

type Action = {
  userID: UserID
} & (
  | { type: 'SET_CODES'; payload: ReducerState['code'] }
  | {
      type: 'MAP_COMBINER_EJECUTADO'
      payload: { combinerResults: { [innerKey: string]: number } }
    }
  | {
      type: 'EJECUTAR_REDUCE'
      payload: {
        reduceKeys: ReducerState['reduceKeys']
        sendKeys: ReducerState['sendKeys']
        receiveKeysFrom: ReducerState['receiveKeysFrom']
      }
    }
  | {
      type: 'RECIBIR_CLAVES'
      payload: {
        [key: string]: unknown[]
      }
    }
  | { type: 'RESULTADO_FINAL'; payload: ReducerState['resultadoFinal'] }
)

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
      const newReceivedKeys = { ...state.clavesRecibidas }
      newReceivedKeys[action.userID] = action.payload

      return {
        ...state,
        clavesRecibidas: newReceivedKeys,
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
