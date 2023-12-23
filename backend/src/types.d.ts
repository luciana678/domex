import { type UUID } from 'crypto'

export type Session = {
  userName: string
  userID: UserID
  connected: boolean
}
export type RoomID = `${string & { length: 10 }}`
export type SessionID = UUID
export type UserID = UUID

export type RoomSessions = Map<SessionID, Session>
export type Rooms = Map<RoomID, RoomSessions>
