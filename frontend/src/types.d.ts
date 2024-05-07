import { type UUID } from 'crypto'
import type SimplePeer from 'simple-peer'

// Extend the interface
declare module 'socket.io-client' {
  interface Socket {
    userID: UserID
  }
}

export type RoomSession = {
  sessionID: SessionID
  roomID: RoomID
  userName: string
  isRoomOwner: boolean
}

export type BaseUser = {
  userID: UserID
  userName: string
  socketConnected: boolean
  peerConnected?: boolean
  isRoomOwner: boolean
}

export type User = BaseUser & {
  readyToExecuteMap: boolean
  executionStatus: string
}

export type Peers = {
  [userID: UserID]: SimplePeer.Instance
}

export type RoomID = `${string & { length: 10 }}`
export type SessionID = UUID
export type UserID = UUID

export type Code = {
  mapCode: string
  combinerCode: string
  reduceCode: string
}

export type Output = {
  stderr: Code
  stdout: string
}

export type ReducerState = {
  code: Code
  combinerResults: UserResults
  mapResults: UserResults
  reduceKeys: KeyValuesCount
  reduceResult: KeyValue
  sizes: Sizes
  timeStatistics: {
    mapTimes: number[]
    combinerTimes: number[]
    reduceTimes: number[]
    avgMapTime: number
    maxMapTime: number
    minMapTime: number
    avgCombinerTime: number
    maxCombinerTime: number
    minCombinerTime: number
    avgReduceTime: number
    maxReduceTime: number
    minReduceTime: number
  }
  clavesRecibidas: { [user: UserID]: { [innerKey: string]: unknown[] } }
  receiveKeysFrom: UserID[] | null
  sendKeys: null | {
    [userToSendKeys: UserID]: string[]
  }
  mapNodesCount: int
  finishedMapNodes: int
  finishedCombinerNodes: int
  finishedReducerNodes: int
  output: Output
  errors: string
  resetState: int
  resetReadyToExecute: int
  totalNodes: int
  finishedNodes: int
}

export type KeyValuesCount = {
  [innerKey: string]: number
}

export type UserResults = {
  [user: UserID]: KeyValuesCount
}

export type KeyValues = {
  [key: string]: unknown[]
}

export type KeyValue = {
  [key: string]: unknown
}

export type MapCombinerResults = {
  mapResults: KeyValues
  combinerResults: KeyValues
}

export type Sizes = {
  inputFiles: int
  mapInput: int
  mapOutput: int
  combinerOutput: int
  totalKeysSent: int
  totalValuesSent: int
  totalBytesSent: int
  totalKeysReceived: int
  totalValuesReceived: int
  totalBytesReceived: int
  reduceInput: int
  reduceOutput: int
  mapCodeTime: int
  combinerCodeTime: int
  reduceCodeTime: int
}

export type FinalResults = {
  mapTotalCount: KeyValuesCount
  combinerTotalCount: KeyValuesCount
  sizes: Sizes
  mapNodesCount?: int
  reducerNodesCount?: int
}

export type Statistics = {
  title: string
  statistics: { label: string; value: string | number }[]
}

export type Tree = {
  isFolder: boolean
  isLocal?: boolean
  name: string
  items?: Tree[]
}
