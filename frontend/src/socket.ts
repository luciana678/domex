import { io } from 'socket.io-client'
import { ENVS } from './constants/envs'

export const socket = io(ENVS.SERVER.URL, {
  autoConnect: false,
})

socket.onAny((event, ...args) => {
  console.log(event, args)
})
