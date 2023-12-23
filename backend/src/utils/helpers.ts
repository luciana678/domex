import crypto, { type UUID } from 'crypto'
import { type RoomID } from '../types.js'

export const generateRandomRoomId = (): RoomID => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let roomId = ''
  for (let i = 0; i < 10; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return roomId as RoomID
}

export const generateRandomUUID = (): UUID => {
  return crypto.randomUUID()
}
