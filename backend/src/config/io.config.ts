import type http from 'node:http'
import { Server, type Socket } from 'socket.io'
import { type RoomID, type SessionID, type UserID } from '../types.js'
import { InMemoryRoomSessionStore } from '../store/InMemorySessionStore.js'
import { generateRandomRoomId, generateRandomUUID } from '../utils/helpers.js'
import LoggerService from '../services/logger.services.js'

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

    // registerWebRTCHandshake(io, socket)
    // registerRoom(io, socket, roomsSessionStore)

    // persist session
    roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
      userName: socket.userName,
      userID: socket.userID,
      connected: true,
    })

    // emit session details
    socket.emit('room:session', {
      sessionID: socket.sessionID,
      userID: socket.userID,
      userName: socket.userName,
      roomID: socket.roomID,
    })

    // join the room
    await socket.join(socket.roomID)

    // fetch existing users
    const users = roomsSessionStore.findAllSessions(socket.roomID)
    const existingUsers = users.filter((user) => user.userID !== socket.userID)
    socket.emit('room:users', existingUsers)

    // notify existing users
    socket.broadcast.to(socket.roomID).emit('room:user-connected', {
      userID: socket.userID,
      userName: socket.userName,
      connected: true,
    })

    // leave room
    socket.on('room:leave-room', async () => {
      LoggerService.socket('A user left the room:', socket.id)
      roomsSessionStore.removeSession(socket.roomID, socket.sessionID)

      socket.broadcast.to(socket.roomID).emit('room:user-leave', {
        userID: socket.userID,
        userName: socket.userName,
      })

      await socket.leave(socket.roomID)
    })

    socket.on('disconnect', () => {
      LoggerService.socket('A user disconnected:', socket.id)
      roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
        userName: socket.userName,
        userID: socket.userID,
        connected: false,
      })

      socket.broadcast.to(socket.roomID).emit('room:user-disconnected', {
        userID: socket.userID,
        userName: socket.userName,
      })
    })
  })

  return io
}
