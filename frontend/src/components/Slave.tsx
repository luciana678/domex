'use client'

import { Button } from '@mui/material'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import { placeholdersFunctions } from '@/constants/functionCodes'
import InputSelector from '@/components/InputSelector'
import { usePython } from 'react-py'
import { useState } from 'react'
import { code } from '@/utils/python/tmp'
import useRoom from '@/hooks/useRoom'

export default function Slave() {
  const roomProps = useRoom()
  const { state } = roomProps
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  async function concatenateFiles(files: File[]) {
    try {
      const readPromises = files.map((file) => file.text())
      const contents = await Promise.all(readPromises)
      const concatenatedContent = contents.join('\n')
      return concatenatedContent
    } catch (error) {
      console.error('Error concatenando archivos:', error)
      throw error
    }
  }

  const mapCode = `
def fmap(value):
  words = value.split()
  for w in words:
      context.write(w, 1)
`

  const reduceCode = `
def fred(key, values):
  context.write(key, sum(values))
`

  const { runPython, stdout, stderr, writeFile, readFile, isReady } = usePython()

  const runCode = async () => {
    await writeFile('/input.txt', await concatenateFiles(selectedFiles))
    await writeFile('/map_code.py', state.code.mapCode)
    await writeFile('/reduce_code.py', state.code.reduceCode)
    isReady && runPython(code)
  }

  const readMapResults = async () => {
    const mapResults = await readFile('/map_results.txt')
    const reduceResults = await readFile('/reduce_results.txt')
    console.log('mapResults', mapResults)
    console.log('reduceResults', reduceResults)
  }

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Unido al cluster #${roomProps.roomSession?.roomID}`} />
      <div className='flex flex-row justify-center w-full gap-20 mb-5'>
        <div className='w-9/12'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            codeState={[state.code.mapCode, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
          <BasicAccordion
            title={placeholdersFunctions.combiner.title}
            codeState={[state.code.combinerCode, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            codeState={[state.code.reduceCode, null]}
            showLoadFileButton={false}
            codeEditorProps={{
              readOnly: true,
            }}
          />
        </div>
        <div className='flex flex-col w-3/12'>
          <InputSelector filesState={[selectedFiles, setSelectedFiles]} />
        </div>
      </div>
      <Button variant='outlined' color='success' onClick={() => runCode()}>
        Iniciar procesamiento
      </Button>

      <pre className='mt-4 text-left'>
        SALIDA:
        <textarea value={stdout}></textarea>
        <code className='text-red-500'>{stderr}</code>
      </pre>

      <Button variant='outlined' color='error' onClick={() => readMapResults()}>
        Leer resultados
      </Button>
    </main>
  )
}
