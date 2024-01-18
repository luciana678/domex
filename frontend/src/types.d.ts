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

export type User = {
  userID: UserID
  userName: string
  socketConnected: boolean
  peerConnected?: boolean
  isRoomOwner: boolean
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
  combinerResults: { [key: string]: { [innerKey: string]: unknown } }
  reduceKeys: { [key: string]: unknown }
  clavesRecibidas: { [key: string]: { [innerKey: string]: number[] } }
  receiveKeysFrom: string[]
  resultadoFinal: { [key: string]: unknown }
  sendKeys: {
    [user: UserID]: string[]
  }
}
