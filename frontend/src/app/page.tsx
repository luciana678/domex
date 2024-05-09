'use client'

import useInitializeRoom from '@/hooks/useInitializeRoom'
import useRoom from '@/hooks/useRoom'
import { RoomID } from '@/types'
import { Button, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'

export default function Home() {
  useInitializeRoom()
  const { connectRoom } = useRoom()
  const [missingUserName, setMissingUserName] = useState(false)
  const [missingClusterId, setMissingClusterId] = useState(false)
  const userRef = useRef<HTMLInputElement>(null)

  const checkUserName = () => {
    const userName = userRef.current?.value
    const thereIsUserName = !!userName
    setMissingUserName(!thereIsUserName)

    // if (thereIsUserName) setUserName(userName)

    return thereIsUserName
  }

  const handleCreateCluster = () => {
    const thereIsUserName = checkUserName()

    if (!thereIsUserName) return

    connectRoom({
      userName: userRef.current?.value,
    })
  }

  const handleSubmitJoinCluster = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const thereIsUserName = checkUserName()

    const clusterId = (e.currentTarget[0] as HTMLInputElement).value

    setMissingClusterId(!clusterId)

    if (!thereIsUserName || !clusterId) return

    connectRoom({
      userName: userRef.current?.value,
      roomID: clusterId as RoomID,
    })
  }

  // TODO: Separate in components

  return (
    <main className='flex min-h-full justify-center items-center px-24 lg:p-0  '>
      <section className='flex flex-col items-center'>
        <div className='pb-5 max-w-xs'>
          <TextField
            label='Usuario*'
            inputRef={userRef}
            helperText={missingUserName ? 'Usuario necesario' : ''}
            error={missingUserName}></TextField>
        </div>
        <div className='flex gap-5'>
          <form className='flex gap-5 flex-col' onSubmit={handleSubmitJoinCluster}>
            <TextField
              label='Unirse a un cluster'
              helperText={missingClusterId ? 'Identificador de cluster necesario' : ''}
              error={missingClusterId}></TextField>
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
        <Typography variant='body2' className='mt-2 self-start' color='text.secondary'>
          (*) Campos obligatorio
        </Typography>
      </section>
    </main>
  )
}
