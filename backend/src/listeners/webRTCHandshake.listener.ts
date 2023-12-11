import { type Server, type Socket } from 'socket.io'
import LoggerService from '../services/logger.services.js'

export default function registerWebRTCHandshake(io: Server, socket: Socket): void {
  socket.on('webRTC-handshake-test', (data) => {
    LoggerService.info('webRTC-handshake', data)

    io.to(data.to).emit('webRTC-handshake', data)
  })
}
