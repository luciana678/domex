import { type Server, type Socket } from 'socket.io'
import { type InMemoryRoomSessionStore } from '../store/InMemorySessionStore.js'
import LoggerService from '../services/logger.services.js'

export const registerRoom = async (
  io: Server,
  socket: Socket,
  roomsSessionStore: InMemoryRoomSessionStore,
): Promise<void> => {
  // persist session
  roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
    userName: socket.userName,
    userID: socket.userID,
    socketConnected: true,
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
  // join the user's own room
  await socket.join(socket.userID)

  // fetch existing users
  const users = roomsSessionStore.findAllSessions(socket.roomID)
  const existingUsers = users.filter((user) => user.userID !== socket.userID)
  socket.emit('room:users', existingUsers)

  // notify existing users
  socket.broadcast.to(socket.roomID).emit('room:user-connected', {
    userID: socket.userID,
    userName: socket.userName,
    socketConnected: true,
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
    await socket.leave(socket.userID)
  })

  socket.on('disconnect', () => {
    LoggerService.socket('A user disconnected:', socket.id)

    const session = roomsSessionStore.findSession(socket.roomID, socket.sessionID)
    if (!session) return

    roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
      userName: socket.userName,
      userID: socket.userID,
      socketConnected: false,
    })

    socket.broadcast.to(socket.roomID).emit('room:user-disconnected', {
      userID: socket.userID,
      userName: socket.userName,
    })
  })
}
