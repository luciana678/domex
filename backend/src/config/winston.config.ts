import winston from 'winston'
import { NODE_ENV } from '../constants/envVars.js'

const customLabels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'redBG',
    error: 'red underline',
    warning: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
}

const COMMONS = {
  colorize: winston.format.colorize(),
  timestamp: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
}

const FORMATS = {
  console: winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`
  }),

  file: winston.format.json(),
}

const COMBINES = {
  console: winston.format.combine(COMMONS.timestamp, COMMONS.colorize, FORMATS.console),
  file: winston.format.combine(COMMONS.timestamp, FORMATS.file),
}

const TRANSPORTS = {
  production: [
    new winston.transports.File({
      level: 'error',
      filename: `./logs/prod/errors.log`,
      format: COMBINES.file,
      handleExceptions: true,
    }),
    new winston.transports.Console({
      level: 'info',
      format: COMBINES.console,

      handleExceptions: true,
    }),
  ],
  development: [
    new winston.transports.File({
      level: 'error',
      filename: `./logs/dev/errors.log`,
      format: COMBINES.file,
      handleExceptions: true,
    }),
    new winston.transports.Console({
      level: 'debug',
      format: COMBINES.console,
      handleExceptions: true,
    }),
  ],
  test: [
    new winston.transports.File({
      level: 'error',
      filename: `./logs/test/errors.log`,
      format: COMBINES.file,
      handleExceptions: true,
    }),
  ],
}

winston.addColors(customLabels.colors)

export const logger = winston.createLogger({
  transports: TRANSPORTS[NODE_ENV as keyof typeof TRANSPORTS],
  exitOnError: false,
  levels: customLabels.levels,
})
