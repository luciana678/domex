import './config/env.config.js'

import cors from 'cors'
import express, { type Request, type Response } from 'express'
import { createServer as createServerHTTPS } from 'node:https'
import { createServer as createServerHTTP } from 'node:http'
import { HOST, HTTPS, PORT } from './constants/envVars.js'
import LoggerService from './services/logger.services.js'
import { createIOServer } from './config/io.config.js'
import packageJSON from '../package.json' assert { type: 'json' }
import { readFileSync } from 'node:fs'

const options = {
  key: readFileSync('./certs/server.key'),
  cert: readFileSync('./certs/server.crt'),
}

const app = express()
const server = HTTPS ? createServerHTTPS(options, app) : createServerHTTP(app)
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
