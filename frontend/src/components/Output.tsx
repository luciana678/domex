import { Textarea } from '@mui/joy'
import { FormLabel } from '@mui/material'

export default function Output({ stdout, stderr }: { stdout: string; stderr: string }) {
  return (
    <div className='mt-4 flex flex-col w-[600px] gap-5'>
      <div>
        <FormLabel>Salida estándar</FormLabel>
        <Textarea defaultValue={stdout} variant='soft' maxRows={5} />
      </div>
      <div>
        <FormLabel>Errores</FormLabel>
        <Textarea defaultValue={stderr} color='danger' variant='soft' maxRows={5} />
      </div>
    </div>
  )
}
