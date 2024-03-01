'use client'

import InputSelector from '@/components/InputSelector'
import { placeholdersFunctions } from '@/constants/functionCodes'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { KeyValues, MapCombinerResults, KeyValue, UserID, Sizes } from '@/types'
import { PY_MAIN_CODE } from '@/utils/python/tmp'
import { Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { usePython } from 'react-py'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import useMapReduce from '@/hooks/useMapReduce'
import { initialSizes } from '@/context/MapReduceContext'

export default function Slave() {
  const { roomOwner, roomSession } = useRoom()
  const { sendDirectMessage, broadcastMessage } = usePeers()
  const { mapReduceState } = useMapReduce()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [mapCombinerResults, setMapCombinerResults] = useState<MapCombinerResults>({
    mapResults: {},
    combinerResults: {},
  })
  const mapCombinerExecuted =
    selectedFiles.length > 0 ? Object.keys(mapCombinerResults.mapResults).length > 0 : true
  const combinerResults = mapCombinerResults.combinerResults
  const [isReadyToExecute, setIsReadyToExecute] = useState(false)
  const [finished, setFinished] = useState(false)
  const sizes = useRef<Sizes>(initialSizes)

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

  const updateSizes = async () => {
    const newSizes: Sizes = JSON.parse((await readFile('/sizes.json')) || '')
    for (const key in newSizes) {
      sizes.current[key as keyof Sizes] = newSizes[key as keyof Sizes]
    }
  }

  const countKeyValues = (combinerResults: KeyValues) =>
    Object.keys(combinerResults).reduce((result: { [key: string]: number }, key: string) => {
      result[key] = combinerResults[key].length
      return result
    }, {})

  const { runPython, stdout, stderr, writeFile, readFile, isReady } = usePython()

  const runCode = async () => {
    const readMapCombinerResults = async (): Promise<MapCombinerResults> => {
      const mapResults: KeyValues = JSON.parse((await readFile('/map_results.txt')) || '')
      const combinerResults: KeyValues = JSON.parse((await readFile('/combiner_results.txt')) || '')
      return { mapResults, combinerResults }
    }

    setMapCombinerResults({
      mapResults: {},
      combinerResults: {},
    })
    await writeFile('/input.txt', await concatenateFiles(selectedFiles))
    await writeFile('/map_code.py', mapReduceState.code.mapCode)
    await writeFile('/combiner_code.py', mapReduceState.code.combinerCode)
    await writeFile('/reduce_code.py', mapReduceState.code.reduceCode)
    await runPython(PY_MAIN_CODE)
    const mapCombinerResults = await readMapCombinerResults()
    setMapCombinerResults(mapCombinerResults)
    await updateSizes()

    const data = {
      type: 'MAP_COMBINER_EJECUTADO',
      payload: {
        combinerResults: countKeyValues(mapCombinerResults.combinerResults),
        mapResults: countKeyValues(mapCombinerResults.mapResults),
      },
    }
    sendDirectMessage(roomOwner?.userID as UserID, data)
  }

  useEffect(() => {
    // todavía no se recibió el código map a ejecutar
    if (mapReduceState.code.mapCode == placeholdersFunctions.map.code) return

    // todavía no se puede ejecutar código python
    if (!isReady) return

    runCode()
  }, [mapReduceState.code, isReady])

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
    const newReduceKeys: KeyValues = {}
    Object.keys(mapReduceState.reduceKeys).forEach(
      (key) => (newReduceKeys[key] = newCombinerResults[key]),
    )

    const readResult = async () => {
      await writeFile('/reduce_keys.json', JSON.stringify(newReduceKeys))
      await runPython(PY_MAIN_CODE)

      const data = (await readFile('/reduce_results.txt')) || ''
      const reduceResult: KeyValue = JSON.parse(data)
      await updateSizes()

      sendDirectMessage(roomOwner?.userID as UserID, {
        type: 'RESULTADO_FINAL',
        payload: { reduceResult, sizes: sizes.current },
      })
    }

    readResult()

    setFinished(true)
  }, [
    combinerResults,
    finished,
    isReady,
    mapCombinerExecuted,
    roomOwner,
    mapReduceState.clavesRecibidas,
    mapReduceState.receiveKeysFrom,
    mapReduceState.reduceKeys,
  ])

  const readyToExecute = () => {
    setIsReadyToExecute(true)
    broadcastMessage({
      type: 'READY_TO_EXECUTE',
    })
  }

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
              <InputSelector
                filesState={[selectedFiles, setSelectedFiles]}
                enableEditing={!isReadyToExecute}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        variant='outlined'
        color='success'
        onClick={readyToExecute}
        disabled={isReadyToExecute}>
        Listo para ejecutar
      </Button>

      <pre className='mt-4 text-left'>
        <textarea defaultValue={stdout}></textarea>
        <code className='text-red-500'>{stderr}</code>
      </pre>
    </main>
  )
}
