import { type RoomID, type Rooms, type Session, type SessionID } from '../types.js'
import { type RoomSessionStore } from './RoomSessionStore.js'

export class InMemoryRoomSessionStore implements RoomSessionStore {
  rooms!: Rooms

  constructor() {
    this.rooms = new Map()
  }

  findSession = (roomID: RoomID, sessionID: SessionID): Session | undefined => {
    const room = this.rooms.get(roomID)
    if (!room) return undefined
    return room.get(sessionID)
  }

  saveSession = (roomID: RoomID, sessionID: SessionID, session: Session): void => {
    const room = this.rooms.get(roomID)
    if (!room) {
      const newRoom = new Map([[sessionID, session]])
      this.rooms.set(roomID, newRoom)
    } else {
      room.set(sessionID, session)
    }
  }

  findAllSessions = (roomID: RoomID): Session[] => {
    const room = this.rooms.get(roomID)
    if (!room) return []
    return [...room.values()]
  }

  removeSession = (roomID: RoomID, sessionID: SessionID): void => {
    const room = this.rooms.get(roomID)
    if (!room) return
    room.delete(sessionID)
  }

  removeRoom = (roomID: RoomID): void => {
    this.rooms.delete(roomID)
  }
}
