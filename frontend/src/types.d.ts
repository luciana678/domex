// Extend the interface
declare module 'socket.io-client' {
  interface Socket {
    userID: string
  }
}

export type RoomSession = {
  sessionID: SessionID
  roomID: RoomID
  userName: string
}

export type User = {
  userID: string
  userName: string
  connected: boolean
}

export type RoomID = `${string & { length: 10 }}`
export type SessionID = UUID
export type UserID = UUID
