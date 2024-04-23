import crypto, { type UUID } from 'crypto'
import { type RoomID } from '../types.js'
import { ROOM_IDS_LENGTH } from '../constants/envVars.js'

export const generateRandomRoomId = (): RoomID => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let roomId = ''
  for (let i = 0; i < ROOM_IDS_LENGTH; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return roomId as RoomID
}

export const generateRandomUUID = (): UUID => {
  return crypto.randomUUID()
}
