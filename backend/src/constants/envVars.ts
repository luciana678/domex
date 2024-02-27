export const NODE_ENV = process.env.NODE_ENV ?? 'development'
export const PORT = Number(process.env.PORT) || 5000
export const HOST = process.env.HOST ?? 'localhost'
export const HTTPS = Boolean(process.env.HTTPS) || false
