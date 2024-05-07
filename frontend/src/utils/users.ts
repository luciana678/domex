import { User } from '@/types'

export function getExecutionStatus(user: User) {
  if (user.isRoomOwner) return '(Master)'
  if (!user.socketConnected) return 'Socket desconectado...'
  if (user.socketConnected && !user.peerConnected) return 'Peer desconectado...'
  return user.executionStatus
}

export function getConnectionStatus(user: User) {
  if (!user.socketConnected) return '🔴'

  if (!user.peerConnected) return '🟡'

  if (user.executionStatus.includes('Error')) return '🐞'

  return '🟢'
}
