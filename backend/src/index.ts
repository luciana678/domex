import './config/env.config.js'

import express, { type Request, type Response } from 'express'
import LoggerService from './services/logger.services.js'

const app = express()
const port = 5000

app.get('/', (req: Request, res: Response) => {
  res.json({ greeting: 'Hello world!' })
})

const httpServer = app.listen(port, () => {
  LoggerService.info(`🚀 server started at http://localhost:${port}`)
})

export { app, httpServer }
