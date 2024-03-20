'use client'

import { placeholdersFunctions } from '@/constants/functionCodes'
import { KeyValuesCount, ReducerState, Sizes, UserID } from '@/types'
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
  UPDATE_FILES: 'UPDATE_FILES',
} as const

export type Action = {
  userID: UserID
  payload: unknown
  payloadSize: number
} & (
  | { type: 'SET_CODES'; payload: ReducerState['code'] }
  | {
      type: 'MAP_COMBINER_EJECUTADO'
      payload: {
        combinerResults: KeyValuesCount
        mapResults: KeyValuesCount
      }
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
  | {
      type: 'RESULTADO_FINAL'
      payload: { sizes: Sizes; reduceResult: ReducerState['reduceResult'] }
    }
  | { type: 'READY_TO_EXECUTE' }
  | {
      type: 'UPDATE_FILES'
      payload: { fileNames: string[] }
    }
)

export const initialSizes: Sizes = {
  inputFiles: 0,
  mapInput: 0,
  mapOutput: 0,
  combinerOutput: 0,
  totalKeysSent: 0,
  totalValuesSent: 0,
  totalBytesSent: 0,
  totalKeysReceived: 0,
  totalValuesReceived: 0,
  totalBytesReceived: 0,
  reduceInput: 0,
  reduceOutput: 0,
}

const initialState: ReducerState = {
  code: {
    mapCode: placeholdersFunctions.map.code,
    combinerCode: placeholdersFunctions.combiner.code,
    reduceCode: placeholdersFunctions.reduce.code,
  },
  combinerResults: {},
  mapResults: {},
  reduceKeys: {},
  sendKeys: null,
  clavesRecibidas: {},
  receiveKeysFrom: null,
  reduceResult: {},
  sizes: initialSizes,
  mapNodesCount: 0,
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
        mapResults: {
          ...state.mapResults,
          [action.userID]: action.payload.mapResults,
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
        sizes: {
          ...state.sizes,
          totalBytesReceived: state.sizes.totalBytesReceived + action.payloadSize,
        },
        clavesRecibidas: {
          ...state.clavesRecibidas,
          [action.userID]: action.payload,
        },
      }
    case actionTypes.RESULTADO_FINAL:
      const currentSizes = { ...state.sizes }
      const newSizes = { ...action.payload.sizes }
      for (const key in newSizes) {
        currentSizes[key as keyof Sizes] += newSizes[key as keyof Sizes]
      }
      const newReduceResult = {
        ...state.reduceResult,
        ...action.payload.reduceResult,
      }
      return {
        ...state,
        reduceResult: newReduceResult,
        sizes: currentSizes,
        mapNodesCount: newSizes.inputFiles ? state.mapNodesCount + 1 : state.mapNodesCount,
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
