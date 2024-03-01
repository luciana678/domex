import { type Server, type Socket } from 'socket.io'
import LoggerService from '../services/logger.services.js'
import { type InMemoryRoomSessionStore } from '../store/InMemorySessionStore.js'

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
    isRoomOwner: socket.isRoomOwner,
  })

  // emit session details
  socket.emit('room:session', {
    sessionID: socket.sessionID,
    userID: socket.userID,
    userName: socket.userName,
    roomID: socket.roomID,
    isRoomOwner: socket.isRoomOwner,
  })

  // join the room
  await socket.join(socket.roomID)
  // join the user's own room
  await socket.join(socket.userID)

  const users = roomsSessionStore.findAllSessions(socket.roomID)
  const usersWitoutMe = users.filter((user) => user.userID !== socket.userID)
  socket.emit('room:users', usersWitoutMe)

  socket.broadcast.to(socket.roomID).emit(`room:user-connected`, {
    userID: socket.userID,
    userName: socket.userName,
    isRoomOwner: socket.isRoomOwner,
    socketConnected: true,
  })

  socket.on('room:leave-room', async () => {
    LoggerService.socket(
      `${socket.isRoomOwner ? 'Owner' : 'User'} ${socket.userName} left the room: ${
        socket.roomID
      }, ${socket.userID}`,
    )
    roomsSessionStore.removeSession(socket.roomID, socket.sessionID)

    socket.broadcast.to(socket.roomID).emit(`room:user-leave`, {
      userID: socket.userID,
      userName: socket.userName,
    })

    await socket.leave(socket.roomID)
    await socket.leave(socket.userID)
  })

  socket.on('disconnect', () => {
    LoggerService.socket(
      `${socket.isRoomOwner ? 'Owner' : 'User'} ${socket.userName} disconnected from room: ${
        socket.roomID
      }`,
      socket.id,
    )

    const session = roomsSessionStore.findSession(socket.roomID, socket.sessionID)
    if (!session) return

    roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
      userName: socket.userName,
      userID: socket.userID,
      isRoomOwner: socket.isRoomOwner,
      socketConnected: false,
    })

    socket.broadcast.to(socket.roomID).emit(`room:user-disconnected`, {
      userID: socket.userID,
      userName: socket.userName,
    })
  })
}
