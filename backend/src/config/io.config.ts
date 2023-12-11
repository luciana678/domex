import { Server } from 'socket.io'

import { httpServer } from '../index.js'
import LoggerService from '../services/logger.services.js'
import registerWebRTCHandshake from '../listeners/webRTCHandshake.listener.js'

// Socket.io
const io = new Server(httpServer)

io.on('connection', (socket) => {
  LoggerService.info('New connection: ' + socket.id)

  registerWebRTCHandshake(io, socket)
})

export { io }
