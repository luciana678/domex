import { type InMemoryRoomSessionStore } from '@/store/InMemorySessionStore.js'
import { type Server, type Socket } from 'socket.io'

export const registerRoom = (
  io: Server,
  socket: Socket,
  roomsSessionStore: InMemoryRoomSessionStore,
): void => {}
