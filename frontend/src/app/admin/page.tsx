import { Button } from '@mui/material'
import BasicAccordion from '../../components/Accordion'
import Navbar from '../../components/Navbar'
import NodeList from '../../components/NodeList'
import { placeholdersFunctions } from '@/constants/functionCodes'

export default function Admin() {
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
        <NodeList nodes={['Nodo1', 'Nodo2', 'Nodo3']} />
      </div>
      <Button variant='outlined' color='success'>
        Iniciar procesamiento
      </Button>
    </main>
  )
}
