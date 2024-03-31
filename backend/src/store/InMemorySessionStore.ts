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
    return room.sessions.get(sessionID)
  }

  saveSession = (roomID: RoomID, sessionID: SessionID, session: Session): void => {
    const room = this.rooms.get(roomID)
    if (!room) {
      const newRoom = { sessions: new Map([[sessionID, session]]), locked: false }
      this.rooms.set(roomID, newRoom)
    } else {
      room.sessions.set(sessionID, session)
    }
  }

  findAllSessions = (roomID: RoomID): Session[] => {
    const room = this.rooms.get(roomID)
    if (!room) return []
    return [...room.sessions.values()]
  }

  removeSession = (roomID: RoomID, sessionID: SessionID): void => {
    const room = this.rooms.get(roomID)
    if (!room) return
    room.sessions.delete(sessionID)
  }

  removeRoom = (roomID: RoomID): void => {
    this.rooms.delete(roomID)
  }

  existsRoom = (roomID: RoomID): boolean => {
    return this.rooms.has(roomID)
  }

  toggleRoomLock = (roomID: RoomID): void => {
    const room = this.rooms.get(roomID)
    if (!room) return
    room.locked = !room.locked
  }

  isLocked = (roomID: RoomID): boolean => !!this.rooms.get(roomID)?.locked
}
