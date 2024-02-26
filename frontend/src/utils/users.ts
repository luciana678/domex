import { User } from '@/types'

export function getExecutionStatus(user: User) {
  if (user.isRoomOwner) return '(Master)'
  return user.readyToExecuteMap ? '(Listo)' : '(Esperando..)'
}

export function getConnectionStatus(user: User) {
  return user.socketConnected ? (user.peerConnected ? '🟢' : '🟡') : '🔴'
}