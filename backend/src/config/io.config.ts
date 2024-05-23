import type http from 'node:http'
import type https from 'node:https'
import { Server, type Socket } from 'socket.io'
import { registerRoom } from '../listeners/registerRoom.js'
import registerWebRTC from '../listeners/registerWebRTC.js'
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
    isRoomOwner: boolean
  }
}

export const createIOServer = (server: http.Server | https.Server): Server => {
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
    const creatingCluster = !!socket.handshake.auth.creatingCluster
    const userName = socket.handshake.auth.userName

    if (!userName) {
      return next(new Error('USER_REQUIRED'))
    }

    const existRoom = roomsSessionStore.existsRoom(roomID)

    // If the room exists and the user is trying to create a new room with the same ID
    if (creatingCluster && existRoom) {
      return next(new Error('CLUSTERID_EXISTS'))
    }

    // If the room does not exist and the user is trying to join a room that does not exist
    if (!creatingCluster && !existRoom) {
      return next(new Error('CLUSTERID_NOT_EXISTS'))
    }

    const session = roomsSessionStore.findSession(roomID, sessionID)

    if (!session && roomsSessionStore.isLocked(roomID)) {
      return next(new Error('CLUSTER_LOCKED'))
    }

    socket.sessionID = session ? sessionID : generateRandomUUID()
    socket.roomID = session ? roomID : roomID || generateRandomRoomId()
    socket.userID = session?.userID ?? generateRandomUUID()
    socket.userName = session?.userName ?? userName
    socket.isRoomOwner = session?.isRoomOwner ?? creatingCluster

    next()
  })

  io.on('connection', async (socket: Socket) => {
    LoggerService.socket('New connection: ' + socket.id)

    await registerRoom(io, socket, roomsSessionStore)
    registerWebRTC(io, socket, roomsSessionStore)
  })

  return io
}
