import { type RoomID, type SessionID, type Session } from '../types.js'

export interface RoomSessionStore {
  findSession: (roomID: RoomID, sessionID: SessionID) => Session | undefined
  findAllSessions: (roomID: RoomID) => Session[]
  saveSession: (roomID: RoomID, sessionID: SessionID, session: Session) => void
  removeSession: (roomID: RoomID, sessionID: SessionID) => void
}
