import { Button } from '@mui/material'
import BasicAccordion from '../../components/Accordion'
import Navbar from '../../components/Navbar'
import NodeList from '../../components/NodeList'
import { placeholdersFunctions } from '@/constants/functionCodes'
import Results from '@/components/Results'

export default function Master() {
  const data = [
    { key: 'Nombre', value: 'John Doe' },
    { key: 'Edad', value: 25 },
    { key: 'Ubicación', value: 'Ciudad XYZ' },
  ]

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar />
      <div className='flex flex-row justify-center w-full gap-20 mb-5'>
        <div className='w-9/12'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            code={placeholdersFunctions.map.code}
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            code={placeholdersFunctions.reduce.code}
          />
          <BasicAccordion
            title={placeholdersFunctions.combiner.title}
            code={placeholdersFunctions.combiner.code}
          />
        </div>
        <div className='flex flex-col w-3/12'>
          <NodeList nodes={['Nodo1', 'Nodo2', 'Nodo3']} />
        </div>
      </div>
      <Button variant='outlined' color='success'>
        Iniciar procesamiento
      </Button>
      <Results className='flex flex-col w-full mt-5' data={data} />
    </main>
  )
}
