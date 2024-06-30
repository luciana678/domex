'use client'

import useRoom from '@/hooks/useRoom'
import { generateInitialsAvatar } from '@/lib/avatars'
import { LogoutRounded as LogoutRoundedIcon } from '@mui/icons-material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import { Avatar, Dropdown, ListDivider, Menu, MenuButton, Typography } from '@mui/joy'
import { Skeleton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import { useEffect, useState } from 'react'

const AvatarImage = ({
  alt = 'avatar icon',
  url = null,
  isLoading = false,
}: {
  isLoading?: boolean
  url: string | null
  alt: string
}) => {
  if (isLoading) return <Skeleton variant='circular' width={32} height={32} />

  return url ? <Avatar size='sm' src={url} alt={alt} /> : <AccountCircle fontSize='large' />
}

export default function Navbar({ title }: { title: string }) {
  const { roomSession, leaveRoom } = useRoom()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)

  const isRoomOwner = roomSession?.isRoomOwner
  const userName = roomSession?.userName

  useEffect(() => {
    if (!userName) return

    setIsLoadingAvatar(true)
    generateInitialsAvatar(userName)
      .then(setAvatarUrl)
      .finally(() => setIsLoadingAvatar(false))
  }, [userName])

  return (
    <Box sx={{ width: '100%', mb: 5 }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography component='div' sx={{ flexGrow: 1 }} textColor={'common.white'}>
            {title}
          </Typography>

          <Dropdown>
            <MenuButton
              variant='plain'
              size='sm'
              aria-label='account of current user'
              aria-haspopup='true'
              sx={{
                bgcolor: 'inherit',
                '&:hover, &:active, &:focus': {
                  bgcolor: 'inherit',
                },
                '&:hover': {
                  filter: 'brightness(0.9)',
                },
                padding: 0,
                borderRadius: '50%',
              }}>
              <AvatarImage isLoading={isLoadingAvatar} alt='username avatar' url={avatarUrl} />
            </MenuButton>
            <Menu
              placement='bottom-end'
              size='sm'
              sx={{
                zIndex: '99999',
                p: 1,
                gap: 1,
                '--ListItem-radius': 'var(--joy-radius-md)',
              }}>
              <MenuItem>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  <AvatarImage isLoading={isLoadingAvatar} alt='username avatar' url={avatarUrl} />
                  <Box sx={{ ml: 1.5 }}>
                    <Typography level='title-sm' textColor='text.primary'>
                      {roomSession?.userName}
                    </Typography>
                    <Typography level='body-xs' textColor='text.tertiary'>
                      Nodo <strong>{isRoomOwner ? 'Master' : 'Slave'}</strong>
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <ListDivider />
              <MenuItem onClick={() => leaveRoom()}>
                <LogoutRoundedIcon />
                <span className='ml-2'>{isRoomOwner ? 'Cerrar cluster' : 'Abandonar cluster'}</span>
              </MenuItem>
            </Menu>
          </Dropdown>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
