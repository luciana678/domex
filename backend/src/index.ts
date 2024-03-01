import './config/env.config.js'

import cors from 'cors'
import express, { type Request, type Response } from 'express'
import { readFileSync } from 'node:fs'
import { type Server as ServerHTTP, createServer as createServerHTTP } from 'node:http'
import { type Server as ServerHTTPS, createServer as createServerHTTPS } from 'node:https'
import packageJSON from '../package.json' assert { type: 'json' }
import { createIOServer } from './config/io.config.js'
import { HOST, HTTPS, PORT, SERVER_CERT_NAME, SERVER_KEY_NAME } from './constants/envVars.js'
import LoggerService from './services/logger.services.js'

const app = express()

let server: ServerHTTP | ServerHTTPS
if (HTTPS) {
  const options = {
    key: readFileSync(`./certs/${SERVER_KEY_NAME}`),
    cert: readFileSync(`./certs/${SERVER_CERT_NAME}`),
  }

  server = createServerHTTPS(options, app)
} else {
  server = createServerHTTP(app)
}

const io = createIOServer(server)

// Middlewares
app.use(cors())

app.get('/health', (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    version: packageJSON.version,
  }

  try {
    res.status(200).send(health)
  } catch (e) {
    health.message = String(e)
    res.status(503).send()
  }
})

server.listen(PORT, HOST, () => {
  LoggerService.info(`🚀 server started at ${HTTPS ? 'https' : 'http'}://${HOST}:${PORT}`)
})

export { app, io }
