import { type ManagerOptions, type SocketOptions, io } from 'socket.io-client'
import { ENVS } from './constants/envs'

// Check if the url is using a path-rewriting proxy in between tecniche
// If so, we need to use the proxy url instead of the server url
// Descompose the url to check if it has a path
const url = new URL(ENVS.SERVER.URL)
const path = url.pathname
const socketURL = url.origin

let options: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: false,
}

if (path !== '/') {
  // If the url has a path, we need to add it to the socket options
  options = {
    ...options,
    path: path + (path.endsWith('/') ? 'socket.io' : '/socket.io'),
  }
}

export const socket = io(socketURL, options)

socket.onAny((event, ...args) => {
  console.log('---', event, args)
})
