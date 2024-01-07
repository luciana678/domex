import { Button } from '@mui/material'
import BasicAccordion from '../../components/Accordion'
import Navbar from '../../components/Navbar'
import { placeholdersFunctions } from '@/constants/functionCodes'
import InputSelector from '@/components/InputSelector'

export default function Slave() {
  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title='Unido al cluster' />
      <div className='flex flex-row justify-center w-full gap-20 mb-5'>
        <div className='w-9/12'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            codeState={[placeholdersFunctions.map.code, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
          <BasicAccordion
            title={placeholdersFunctions.combiner.title}
            codeState={[placeholdersFunctions.combiner.code, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            codeState={[placeholdersFunctions.reduce.code, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
        </div>
        <div className='flex flex-col w-3/12'>
          <InputSelector />
        </div>
      </div>
      <Button variant='outlined' color='success'>
        Iniciar procesamiento
      </Button>
    </main>
  )
}
