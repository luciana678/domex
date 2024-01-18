'use client'

import { Button } from '@mui/material'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import { placeholdersFunctions } from '@/constants/functionCodes'
import InputSelector from '@/components/InputSelector'
import { usePython } from 'react-py'
import { useEffect, useState } from 'react'
import { code } from '@/utils/python/tmp'
import useRoom from '@/hooks/useRoom'
import NodeList from './NodeList'
import usePeers from '@/hooks/usePeers'
import { ReducerState, UserID } from '@/types'

export default function Slave() {
  const roomProps = useRoom()
  const { state, getRoomOwner } = roomProps as { state: ReducerState; getRoomOwner: () => any }
  const { sendDirectMessage } = usePeers()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [combinerResults, setCombinerResults] = useState({} as any)
  const [mapCombinerEjecutado, setMapCombinerEjecutado] = useState(false)
  const [finalizado, setFinalizado] = useState(false)

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

  const { runPython, stdout, stderr, writeFile, readFile, isReady, isRunning } = usePython()

  const runCode = async () => {
    const readCombinerResults = async () => {
      const mapResults = JSON.parse((await readFile('/map_results.txt')) || '')
      const combinerResults = JSON.parse((await readFile('/combiner_results.txt')) || '')
      console.log('mapResults', mapResults)
      console.log('combienrResults', combinerResults)
      setCombinerResults(combinerResults)
      return combinerResults
    }

    setMapCombinerEjecutado(false)
    await writeFile('/input.txt', await concatenateFiles(selectedFiles))
    await writeFile('/map_code.py', state.code.mapCode)
    await writeFile('/combiner_code.py', state.code.combinerCode)
    await writeFile('/reduce_code.py', state.code.reduceCode)
    console.log('EJECUTO 1')
    await runPython(code)
    const results = (await readCombinerResults()) as {
      [key: string]: { [innerKey: string]: number }
    }
    setMapCombinerEjecutado(true)

    const data = {
      type: 'MAP_COMBINER_EJECUTADO',
      payload: {
        combinerResults: Object.keys(results).reduce(
          (result, key) => {
            result[key] = results[key]?.length
            return result
          },
          {} as { [key: string]: number },
        ),
      },
    }
    sendDirectMessage(getRoomOwner().userID, data)
  }

  useEffect(() => {
    if (!mapCombinerEjecutado) return
    if (finalizado) return
    if (!Object.keys(state.reduceKeys).length) return

    Object.entries(state.sendKeys).forEach(([user, keys]) => {
      const keysForUser: { [key: string]: unknown } = {}
      keys.forEach((key) => (keysForUser[key] = combinerResults[key]))
      sendDirectMessage(user as UserID, {
        type: 'RECIBIR_CLAVES',
        payload: keysForUser,
      })
    })
  }, [
    combinerResults,
    finalizado,
    mapCombinerEjecutado,
    sendDirectMessage,
    state.reduceKeys,
    state.sendKeys,
  ])

  useEffect(() => {
    if (finalizado) return
    if (!mapCombinerEjecutado) return
    if (!state.receiveKeysFrom) return
    if (!(state.receiveKeysFrom?.length === Object.keys(state.clavesRecibidas).length)) return
    if (!isReady) return

    const newCombinerResults = { ...combinerResults }
    Object.values(state.clavesRecibidas).forEach((keyList) => {
      Object.entries(keyList as { [key: string]: unknown }).forEach(([key, values]) => {
        newCombinerResults[key] = [...(newCombinerResults[key] || []), ...(values as any[])]
      })
    })

    const newReduceKeys: { [key: string]: unknown } = {}
    Object.keys(state.reduceKeys).forEach((key) => (newReduceKeys[key] = newCombinerResults[key]))

    const readResult = async () => {
      await writeFile('/reduce_keys.json', JSON.stringify(newReduceKeys))
      console.log('EJECUTO 2')
      await runPython(code)
      const data = (await readFile('/reduce_results.txt')) || ''
      const resultados = JSON.parse(data)
      console.log('RESULTADO FINAL', resultados)
      sendDirectMessage(getRoomOwner().userID, {
        type: 'RESULTADO_FINAL',
        payload: resultados,
      })
    }

    readResult()

    setFinalizado(true)
  }, [
    state.clavesRecibidas,
    state.receiveKeysFrom,
    state.reduceKeys,
    isReady,
    finalizado,
    combinerResults,
    writeFile,
    runPython,
    readFile,
    sendDirectMessage,
    getRoomOwner,
    mapCombinerEjecutado,
  ])

  console.log('state', state)
  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Unido al cluster #${roomProps.roomSession?.roomID}`} />
      <div className='w-full flex flex-col'>
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
          <div className='flex flex-col'>
            <div className='flex-grow w-full'>
              <NodeList />
            </div>
            <div className='flex-grow w-full '>
              <InputSelector filesState={[selectedFiles, setSelectedFiles]} />
            </div>
          </div>
        </div>
      </div>
      <Button variant='outlined' color='success' onClick={() => isReady && runCode()}>
        Iniciar procesamiento
      </Button>

      <pre className='mt-4 text-left'>
        SALIDA:
        <textarea defaultValue={stdout}></textarea>
        <code className='text-red-500'>{stderr}</code>
      </pre>
    </main>
  )
}
