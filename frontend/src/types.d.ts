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
}

export type Peers = {
  [userID: UserID]: SimplePeer.Instance
}

export type RoomID = `${string & { length: 10 }}`
export type SessionID = UUID
export type UserID = UUID

export type ReducerState = {
  code: {
    mapCode: string
    combinerCode: string
    reduceCode: string
  }
  combinerResults: { [user: UserID]: { [innerKey: string]: number } }
  reduceKeys: { [key: string]: number }
  clavesRecibidas: { [user: UserID]: { [innerKey: string]: unknown[] } }
  receiveKeysFrom: UserID[] | null
  resultadoFinal: ReduceOutputFile
  sendKeys: {
    [userToSendKeys: UserID]: string[]
  }
}

export type MapOutputFile = {
  [key: string]: unknown[]
}

export type CombinerOuputFile = {
  [key: string]: unknown[]
}

export type ReduceOutputFile = {
  [key: string]: unknown
}
