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
}

export type User = {
  userID: UserID
  userName: string
  socketConnected: boolean
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
}
