import React from 'react'

import PersonIcon from '@mui/icons-material/Person'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'

import { User } from '@/types'
import { Box, Typography } from '@mui/material'

function getUserIcon(user: User) {
  if (user.isRoomOwner) return ManageAccountsIcon
  if (!user.socketConnected || !user.peerConnected) return PersonOffIcon
  return PersonIcon
}

function getExecutionStatus(user: User) {
  if (!user.socketConnected) return 'Socket desconectado...'
  if (user.socketConnected && !user.peerConnected) return 'Peer desconectado...'

  return user.executionStatus
}

function getExecutionStatusColor(user: User) {
  if (!user.socketConnected || user.executionStatus.includes('Error')) return 'error'

  if (!user.peerConnected) return 'warning'

  return 'success'
}

export function UserDisplay(user: User) {
  const Icon = getUserIcon(user)
  const color = getExecutionStatusColor(user)
  const userName = user.userName + (user.isRoomOwner ? ' (Master)' : '')
  const description = getExecutionStatus(user)

  return (
    <Box className='flex flex-row items-center mb-2'>
      <Icon color={color} fontSize='large' className='mr-2' />
      <Box>
        <Typography className='text-base font-bold'>{userName}</Typography>
        {description && <Typography className='text-sm'>{description}</Typography>}
      </Box>
    </Box>
  )
}
