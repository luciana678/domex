'use client'

import InputSelector from '@/components/InputSelector'
import { placeholdersFunctions } from '@/constants/functionCodes'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { CombinerOuputFile, ReduceOutputFile, UserID } from '@/types'
import { PY_MAIN_CODE } from '@/utils/python/tmp'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { usePython } from 'react-py'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import useMapReduce from '@/hooks/useMapReduce'

export default function Slave() {
  const { roomOwner, roomSession } = useRoom()
  const { sendDirectMessage } = usePeers()
  const { mapReduceState } = useMapReduce()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [combinerResults, setCombinerResults] = useState<CombinerOuputFile>({})
  const [mapCombinerExecuted, setMapCombinerExecuted] = useState(false)
  const [finished, setFinished] = useState(false)

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

  const { runPython, stdout, stderr, writeFile, readFile, isReady } = usePython()

  const runCode = async () => {
    const readCombinerResults = async (): Promise<CombinerOuputFile> => {
      const mapResults = JSON.parse((await readFile('/map_results.txt')) || '')
      const combinerResults: CombinerOuputFile = JSON.parse(
        (await readFile('/combiner_results.txt')) || '',
      )
      console.log('mapResults', mapResults)
      console.log('combienrResults', combinerResults)
      setCombinerResults(combinerResults)
      return combinerResults
    }

    setMapCombinerExecuted(false)
    await writeFile('/input.txt', await concatenateFiles(selectedFiles))
    await writeFile('/map_code.py', mapReduceState.code.mapCode)
    await writeFile('/combiner_code.py', mapReduceState.code.combinerCode)
    await writeFile('/reduce_code.py', mapReduceState.code.reduceCode)
    console.log('EJECUTO 1')
    await runPython(PY_MAIN_CODE)
    const combinerResults = await readCombinerResults()

    console.log(combinerResults)
    setMapCombinerExecuted(true)

    const data = {
      type: 'MAP_COMBINER_EJECUTADO',
      payload: {
        combinerResults: Object.keys(combinerResults).reduce(
          (result: { [key: string]: number }, key: string) => {
            result[key] = combinerResults[key].length
            return result
          },
          {},
        ),
      },
    }
    sendDirectMessage(roomOwner?.userID as UserID, data)
  }

  useEffect(() => {
    // That means that the combiner has been executed. Now we can send the keys to the other users (reducers)
    if (finished) return
    if (!mapCombinerExecuted) return
    if (!Object.keys(mapReduceState.sendKeys).length) return

    Object.entries(mapReduceState.sendKeys).forEach(([user, keys]) => {
      const keysForUser: { [key: string]: unknown[] } = {}
      keys.forEach((key) => (keysForUser[key] = combinerResults[key]))

      sendDirectMessage(user as UserID, {
        type: 'RECIBIR_CLAVES',
        payload: keysForUser,
      })
    })
  }, [combinerResults, finished, mapCombinerExecuted, sendDirectMessage, mapReduceState.sendKeys])

  useEffect(() => {
    // Thar useEffect will be executed when all the reducers (users) have sent their keys to the actual user. The map combiner has been executed.
    if (finished) return
    if (!mapCombinerExecuted) return
    // Check if all the keys have been received from the other users.
    if (!mapReduceState?.receiveKeysFrom) return
    if (
      !(
        mapReduceState.receiveKeysFrom?.length ===
        Object.keys(mapReduceState.clavesRecibidas).length
      )
    )
      return
    // Check if the python module is ready to execute the reduce phase.
    if (!isReady) return

    //  Combine all the keys received from the other users
    const newCombinerResults = { ...combinerResults }
    Object.values(mapReduceState.clavesRecibidas).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, values]) => {
        newCombinerResults[key] = [...(newCombinerResults[key] || []), ...values]
      })
    })

    // Discard the keys that the user will not reduce
    const newReduceKeys: CombinerOuputFile = {}
    Object.keys(mapReduceState.reduceKeys).forEach(
      (key) => (newReduceKeys[key] = newCombinerResults[key]),
    )

    const readResult = async () => {
      await writeFile('/reduce_keys.json', JSON.stringify(newReduceKeys))
      console.log('EJECUTO 2')
      await runPython(PY_MAIN_CODE)
      const data = (await readFile('/reduce_results.txt')) || ''
      const resultados: ReduceOutputFile = JSON.parse(data)
      console.log('RESULTADO FINAL', resultados)
      sendDirectMessage(roomOwner?.userID as UserID, {
        type: 'RESULTADO_FINAL',
        payload: resultados,
      })
    }

    readResult()

    setFinished(true)
  }, [
    combinerResults,
    finished,
    isReady,
    mapCombinerExecuted,
    readFile,
    roomOwner,
    runPython,
    sendDirectMessage,
    mapReduceState.clavesRecibidas,
    mapReduceState.receiveKeysFrom,
    mapReduceState.reduceKeys,
    writeFile,
  ])

  console.log('state', mapReduceState)
  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Unido al cluster #${roomSession?.roomID}`} />
      <div className='w-full flex flex-col'>
        <div className='flex flex-row justify-center w-full gap-20 mb-5'>
          <div className='w-9/12'>
            <BasicAccordion
              title={placeholdersFunctions.map.title}
              codeState={[mapReduceState.code.mapCode, null]}
              showLoadFileButton={false}
              codeEditorProps={{
                readOnly: true,
              }}
            />
            <BasicAccordion
              title={placeholdersFunctions.combiner.title}
              codeState={[mapReduceState.code.combinerCode, null]}
              showLoadFileButton={false}
              codeEditorProps={{
                readOnly: true,
              }}
            />
            <BasicAccordion
              title={placeholdersFunctions.reduce.title}
              codeState={[mapReduceState.code.reduceCode, null]}
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
