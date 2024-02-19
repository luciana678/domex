'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { ReducerState, UserID } from '@/types'
import { PropsWithChildren, createContext, useReducer } from 'react'

export type MapReduceContextType = {
  mapReduceState: ReducerState
  dispatchMapReduce: React.Dispatch<Action>
}

export const actionTypes = {
  SET_CODES: 'SET_CODES',
  MAP_COMBINER_EJECUTADO: 'MAP_COMBINER_EJECUTADO',
  EJECUTAR_REDUCE: 'EJECUTAR_REDUCE',
  RECIBIR_CLAVES: 'RECIBIR_CLAVES',
  RESULTADO_FINAL: 'RESULTADO_FINAL',
  READY_TO_EXECUTE: 'READY_TO_EXECUTE',
} as const

export type Action = {
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
  | { type: 'READY_TO_EXECUTE' }
)

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

const MapReduceContext = createContext<MapReduceContextType>({
  mapReduceState: initialState,
  dispatchMapReduce: () => {},
})

const reducer = (state: ReducerState, action: Action) => {
  switch (action.type) {
    case actionTypes.SET_CODES:
      return { ...state, code: action.payload }
    case actionTypes.MAP_COMBINER_EJECUTADO:
      return {
        ...state,
        combinerResults: {
          ...state.combinerResults,
          [action.userID]: action.payload.combinerResults,
        },
      }
    case actionTypes.EJECUTAR_REDUCE:
      const { reduceKeys, sendKeys, receiveKeysFrom } = action.payload
      return {
        ...state,
        reduceKeys,
        sendKeys,
        receiveKeysFrom,
      }
    case actionTypes.RECIBIR_CLAVES:
      return {
        ...state,
        clavesRecibidas: {
          ...state.clavesRecibidas,
          [action.userID]: action.payload,
        },
      }
    case actionTypes.RESULTADO_FINAL:
      return {
        ...state,
        resultadoFinal: { ...state.resultadoFinal, ...action.payload },
      }
    case actionTypes.READY_TO_EXECUTE:
      return state
    default:
      return state
  }
}

export const MapReduceProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [mapReduceState, dispatchMapReduce] = useReducer(reducer, initialState)

  return (
    <MapReduceContext.Provider
      value={{
        mapReduceState,
        dispatchMapReduce,
      }}>
      {children}
    </MapReduceContext.Provider>
  )
}

export default MapReduceContext
