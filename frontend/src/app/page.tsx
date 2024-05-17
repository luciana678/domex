'use client'

import useInitializeRoom from '@/hooks/useInitializeRoom'
import useRoom from '@/hooks/useRoom'
import { RoomID } from '@/types'
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material'
import { Avatar } from '@mui/joy'
import { Button, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'

export default function Home() {
  useInitializeRoom()
  const { joinCluster } = useRoom()
  const [missingUserName, setMissingUserName] = useState(false)
  const [missingClusterId, setMissingClusterId] = useState(false)

  const userRef = useRef<HTMLInputElement>(null)
  const clusterIDRef = useRef<HTMLInputElement>(null)

  const handleCreateCluster = () => {
    const userName = userRef.current?.value
    setMissingUserName(!userName)

    if (!userName) return

    joinCluster({
      userName: userName,
      roomID: clusterIDRef.current?.value as RoomID,
      creatingCluster: true,
    })
  }

  const handleSubmitJoinCluster = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const userName = userRef.current?.value
    const clusterID = clusterIDRef.current?.value

    setMissingUserName(!userName)
    setMissingClusterId(!clusterID)

    if (!userName || !clusterID) return

    joinCluster({
      userName: userName,
      roomID: clusterID as RoomID,
      creatingCluster: false,
    })
  }

  return (
    <main className='flex min-h-full justify-center items-center px-24 lg:p-0  '>
      <section className='flex flex-col items-center'>
        <Avatar sx={{ m: 0, bgcolor: '#3676d2' }} variant='solid'>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h6' marginBottom={3}>
          Ingresar
        </Typography>

        <div className='pb-5 max-w-xs'>
          <TextField
            label='Usuario*'
            inputRef={userRef}
            helperText={missingUserName ? 'Usuario necesario' : ''}
            error={missingUserName}
          />
        </div>
        <div className='flex gap-5'>
          <form className='flex gap-5 flex-col' onSubmit={handleSubmitJoinCluster}>
            <TextField
              label='Indentificador de cluster'
              helperText={missingClusterId ? 'Identificador de cluster necesario' : ''}
              error={missingClusterId}
              inputRef={clusterIDRef}
            />
            <Button variant='outlined' type='submit'>
              Unirse
            </Button>
          </form>
          <Button
            sx={{
              height: 'auto',
            }}
            variant='outlined'
            color='success'
            onClick={handleCreateCluster}>
            Crear un cluster
          </Button>
        </div>
      </section>
    </main>
  )
}
