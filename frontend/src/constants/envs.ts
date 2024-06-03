export const ENVS = {
  SERVER: {
    URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  },
  GENERAL: {
    FILES: {
      MAX_SIZE: 5 * 1024 * 1024, // 5Mb
      ACCEPT: ['.txt', '.csv'],
      FILE_TYPES: ['text/plain', 'text/csv'],
    },
    CHUNK_SIZE: 16 * 1024, // 16 KB
  },
}
