import { type Server, type Socket } from 'socket.io'
import LoggerService from '../services/logger.services.js'
import { type InMemoryRoomSessionStore } from '../store/InMemorySessionStore.js'
import { type Session } from '../types.js'

export const registerRoom = async (
  io: Server,
  socket: Socket,
  roomsSessionStore: InMemoryRoomSessionStore,
): Promise<void> => {
  // persist session
  roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
    userName: socket.userName,
    userID: socket.userID,
    connected: true,
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

  const fetchExistingUsers = (socket: Socket): Session[] => {
    const users = roomsSessionStore.findAllSessions(socket.roomID)
    return users.filter((user) => user.userID !== socket.userID)
  }

  const emitRoomUsers = (socket: Socket, event: string, users: Session[]): void => {
    socket.emit('room:users', users)

    socket.broadcast.to(socket.roomID).emit(`room:${event}`, {
      userID: socket.userID,
      userName: socket.userName,
      connected: true,
    })
  }

  const handleLeaveRoom = async (
    socket: Socket,
    eventType: string,
    logMessage: string,
  ): Promise<void> => {
    LoggerService.socket(logMessage)
    roomsSessionStore.removeSession(socket.roomID, socket.sessionID)

    socket.broadcast.to(socket.roomID).emit(`room:${eventType}`, {
      userID: socket.userID,
      userName: socket.userName,
    })

    await socket.leave(socket.roomID)
    await socket.leave(socket.userID)
  }

  const handleDisconnect = (socket: Socket, eventType: string, logMessage: string): void => {
    LoggerService.socket(logMessage, socket.id)

    const session = roomsSessionStore.findSession(socket.roomID, socket.sessionID)
    if (!session) return

    roomsSessionStore.saveSession(socket.roomID, socket.sessionID, {
      userName: socket.userName,
      userID: socket.userID,
      connected: false,
      isRoomOwner: socket.isRoomOwner,
    })

    socket.broadcast.to(socket.roomID).emit(`room:${eventType}`, {
      userID: socket.userID,
      userName: socket.userName,
    })
  }

  if (socket.isRoomOwner) {
    const users = fetchExistingUsers(socket)
    emitRoomUsers(socket, 'owner-connected', users)

    socket.on('room:leave-room', async (): Promise<void> => {
      await handleLeaveRoom(
        socket,
        'owner-leave',
        `The owner ${socket.userName} left the room: ${socket.roomID}, ${socket.userID}`,
      )
    })

    socket.on('disconnect', (): void => {
      handleDisconnect(
        socket,
        'owner-disconnected',
        `Owner ${socket.userName} disconnected from room: ${socket.roomID}`,
      )
    })
  } else {
    const users = fetchExistingUsers(socket)
    // .filter((user) => !user.isRoomOwner)
    emitRoomUsers(socket, 'user-connected', users)

    socket.on('room:leave-room', async () => {
      await handleLeaveRoom(
        socket,
        'user-leave',
        `User ${socket.userName} left the room: ${socket.roomID}, ${socket.userID}`,
      )
    })

    socket.on('disconnect', () => {
      handleDisconnect(
        socket,
        'user-disconnected',
        `User ${socket.userName} disconnected from room: ${socket.roomID}`,
      )
    })
  }
}
