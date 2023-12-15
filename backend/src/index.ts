import './config/env.config.js'

import express, { type Request, type Response } from 'express'
import LoggerService from './services/logger.services.js'
import { PORT } from './constants/envVars.js'

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.json({ greeting: 'Hello world!' })
})

const httpServer = app.listen(PORT, () => {
  LoggerService.info(`🚀 server started at http://localhost:${PORT}`)
})

export { app, httpServer }
