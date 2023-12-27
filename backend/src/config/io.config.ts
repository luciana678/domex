import type http from 'node:http'
import { Server, type Socket } from 'socket.io'
import { registerRoom } from '../listeners/registerRoom.js'
import LoggerService from '../services/logger.services.js'
import { InMemoryRoomSessionStore } from '../store/InMemorySessionStore.js'
import { type RoomID, type SessionID, type UserID } from '../types.js'
import { generateRandomRoomId, generateRandomUUID } from '../utils/helpers.js'

// Extend the interface
declare module 'socket.io' {
  interface Socket {
    userID: UserID
    sessionID: SessionID
    roomID: RoomID
    userName: string
  }
}

export const createIOServer = (server: http.Server): Server => {
  // Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      // credentials: true,
    },
  })

  const roomsSessionStore = new InMemoryRoomSessionStore()

  io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID as SessionID
    const roomID = socket.handshake.auth.roomID as RoomID

    if (sessionID && roomID) {
      const session = roomsSessionStore.findSession(roomID, sessionID)
      if (session) {
        socket.sessionID = sessionID
        socket.roomID = roomID
        socket.userID = session.userID
        socket.userName = session.userName
        return next()
      }
    }

    const userName = socket.handshake.auth.userName
    if (!userName) {
      return next(new Error('missing username'))
    }

    socket.sessionID = generateRandomUUID()
    socket.userID = generateRandomUUID()
    socket.userName = userName
    socket.roomID = roomID || generateRandomRoomId()
    next()
  })

  io.on('connection', async (socket: Socket) => {
    LoggerService.socket('New connection: ' + socket.id)

    await registerRoom(io, socket, roomsSessionStore)
  })

  return io
}
