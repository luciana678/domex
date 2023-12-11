import { Button, TextField } from '@mui/material'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='pb-5'>
        <TextField label='Usuario'></TextField>
      </div>
      <Button
        sx={{
          width: 225,
          height: 50,
          marginBottom: 2.5,
        }}
        variant='outlined'
        color='success'>
        Crear un cluster
      </Button>
      <div className='flex gap-5 mb-5'>
        <TextField label='Unirse a un cluster'></TextField>
        <Button variant='outlined'>Unirse</Button>
      </div>
    </main>
  )
}
