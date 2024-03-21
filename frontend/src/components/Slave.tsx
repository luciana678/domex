'use client'

import InputSelector from '@/components/InputSelector'
import { Statistics } from '@/components/Statistics'
import { placeholdersFunctions } from '@/constants/functionCodes'
import { initialSizes } from '@/context/MapReduceContext'
import useFiles from '@/hooks/useFiles'
import useMapReduce from '@/hooks/useMapReduce'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import useStatistics from '@/hooks/useStatisticts'
import { FinalResults, KeyValue, KeyValues, MapCombinerResults, Sizes, UserID } from '@/types'
import { concatenateFiles } from '@/utils/helpers'
import { PY_MAIN_CODE } from '@/utils/python/tmp'
import { Button } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { usePython } from 'react-py'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import Results from './Results'

const initialMapCombinerResults: MapCombinerResults = {
  mapResults: {},
  combinerResults: {},
}

export default function Slave() {
  const { roomOwner, roomSession } = useRoom()
  const { sendDirectMessage, broadcastMessage } = usePeers()
  const { mapReduceState } = useMapReduce()
  const { selectedFiles } = useFiles()
  const [mapCombinerResults, setMapCombinerResults] =
    useState<MapCombinerResults>(initialMapCombinerResults)
  const [reduceResults, setReduceResults] = useState<KeyValue>({})
  const [finalResults, setFinalResults] = useState<FinalResults>({
    mapTotalCount: {},
    combinerTotalCount: {},
    sizes: initialSizes,
  })

  const [isReadyToExecute, setIsReadyToExecute] = useState(false)
  const [keysSent, setKeysSent] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mapCombinerExecuted, setMapCombinerExecuted] = useState(false)

  const { runPython, stdout, stderr, writeFile, readFile, isReady } = usePython()

  const statistics = useStatistics(finalResults)

  const updateSizes = (newSizes: Partial<Sizes>) =>
    setFinalResults((prevResults) => ({
      ...prevResults,
      sizes: {
        ...prevResults.sizes,
        ...newSizes,
      },
    }))

  const readSizes = useCallback(async (): Promise<Partial<Sizes>> => {
    let newSizes: Partial<Sizes> = JSON.parse((await readFile('/sizes.json')) || '')
    newSizes.inputFiles = selectedFiles.length
    return { ...newSizes }
  }, [readFile, selectedFiles.length])

  const countKeyValues = (combinerResults: KeyValues) =>
    Object.keys(combinerResults).reduce((result: { [key: string]: number }, key: string) => {
      result[key] = combinerResults[key].length
      return result
    }, {})

  useEffect(() => {
    // This useEffect will be executed when the map code has been received and the python module is ready to execute the map phase.
    // The map combiner fase was be executed.
    if (mapCombinerExecuted) return

    // the map code has not been received yet
    if (mapReduceState.code.mapCode === placeholdersFunctions.map.code) return

    // yet the python code cannot be executed
    if (!isReady) return

    const runCode = async () => {
      const readMapCombinerResults = async (): Promise<MapCombinerResults> => {
        const mapResults: KeyValues = JSON.parse((await readFile('/map_results.txt')) || '')
        const combinerResults: KeyValues = JSON.parse(
          (await readFile('/combiner_results.txt')) || '',
        )
        return { mapResults, combinerResults }
      }

      setMapCombinerResults(initialMapCombinerResults)
      await writeFile('/input.txt', await concatenateFiles(selectedFiles))
      await writeFile('/map_code.py', mapReduceState.code.mapCode)
      await writeFile('/combiner_code.py', mapReduceState.code.combinerCode)
      await writeFile('/reduce_code.py', mapReduceState.code.reduceCode)
      await runPython(PY_MAIN_CODE)
      const mapCombinerResults = await readMapCombinerResults()
      setMapCombinerResults(mapCombinerResults)
      const newSizes = await readSizes()
      updateSizes(newSizes)

      const finalResults: Partial<FinalResults> = {
        mapTotalCount: countKeyValues(mapCombinerResults.mapResults),
        combinerTotalCount: countKeyValues(mapCombinerResults.combinerResults),
      }

      setFinalResults((prevResults) => ({ ...prevResults, ...finalResults }))

      const data = {
        type: 'MAP_COMBINER_EJECUTADO',
        payload: {
          combinerResults: finalResults.combinerTotalCount,
          mapResults: finalResults.mapTotalCount,
        },
      }
      sendDirectMessage(roomOwner?.userID as UserID, data)
    }

    runCode()

    setMapCombinerExecuted(true)
  }, [
    isReady,
    mapCombinerExecuted,
    mapReduceState.code.combinerCode,
    mapReduceState.code.mapCode,
    mapReduceState.code.reduceCode,
    readFile,
    readSizes,
    roomOwner?.userID,
    runPython,
    selectedFiles,
    sendDirectMessage,
    writeFile,
  ])

  useEffect(() => {
    // That means that the combiner has been executed. Now we can send the keys to the other users (reducers)
    if (finished) return
    if (!mapCombinerExecuted) return
    if (keysSent) return

    if (!mapReduceState.sendKeys) return
    // The node does not have any keys to send to the other nodes
    if (!Object.keys(mapReduceState.sendKeys).length) {
      return setKeysSent(true)
    }

    let totalKeysSent = 0
    let totalValuesSent = 0
    let totalBytesSent = 0
    Object.entries(mapReduceState.sendKeys).forEach(([user, keys]) => {
      totalKeysSent += keys.length
      totalValuesSent += keys.reduce(
        (acc, key) => acc + mapCombinerResults.combinerResults[key].length,
        0,
      )

      const keysForUser: { [key: string]: unknown[] } = {}
      keys.forEach((key) => (keysForUser[key] = mapCombinerResults.combinerResults[key]))

      totalBytesSent += sendDirectMessage(user as UserID, {
        type: 'RECIBIR_CLAVES',
        payload: keysForUser,
      })
    })

    updateSizes({
      totalKeysSent,
      totalValuesSent,
      totalBytesSent,
    })

    setKeysSent(true)
  }, [
    mapCombinerResults.combinerResults,
    finished,
    mapCombinerExecuted,
    sendDirectMessage,
    mapReduceState.sendKeys,
    keysSent,
  ])

  useEffect(() => {
    // That useEffect will be executed when all the reducers (users) have sent their keys to the actual user. The map combiner has been executed.
    if (finished) return
    if (!mapCombinerExecuted) return
    if (!keysSent) return
    // Check if the python module is ready to execute the reduce phase.
    if (!isReady) return
    // Check if all the keys have been received from the other users.
    if (!mapReduceState?.receiveKeysFrom) return
    if (
      !(
        mapReduceState.receiveKeysFrom?.length ===
        Object.keys(mapReduceState.clavesRecibidas).length
      )
    )
      return

    //  Combine all the keys received from the other users
    const newCombinerResults = { ...mapCombinerResults.combinerResults }
    let totalKeysReceived = 0
    let totalValuesReceived = 0

    Object.values(mapReduceState.clavesRecibidas).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, values]) => {
        totalKeysReceived++
        totalValuesReceived += values.length
        newCombinerResults[key] = [...(newCombinerResults[key] || []), ...values]
      })
    })

    const receivedDataSizes: Partial<Sizes> = {
      totalKeysReceived,
      totalValuesReceived,
      totalBytesReceived: mapReduceState.sizes.totalBytesReceived,
    }

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
      setReduceResults(reduceResult)

      const reduceSizes = await readSizes()

      sendDirectMessage(roomOwner?.userID as UserID, {
        type: 'RESULTADO_FINAL',
        payload: {
          reduceResult,
          sizes: {
            ...finalResults.sizes,
            ...reduceSizes,
            ...receivedDataSizes,
          },
        },
      })

      return reduceSizes
    }

    const reduceSizes = readResult()

    setFinished(true)

    updateSizes({ ...receivedDataSizes, ...reduceSizes })
  }, [
    keysSent,
    finished,
    isReady,
    mapCombinerExecuted,
    roomOwner,
    mapReduceState.clavesRecibidas,
    mapReduceState.receiveKeysFrom,
    mapReduceState.reduceKeys,
    mapReduceState.sizes.totalBytesReceived,
    writeFile,
    runPython,
    readFile,
    readSizes,
    sendDirectMessage,
    finalResults.sizes,
    mapCombinerResults.combinerResults,
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
        <div className='flex flex-col lg:flex-row justify-center w-full gap-10 mb-5'>
          <div className='w-full'>
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
          <div className='flex flex-col sm:flex-row lg:flex-col sm:justify-center lg:justify-start gap-10 items-center w-full  min-w-fit lg:max-w-[300px]'>
            <NodeList />
            <InputSelector enableEditing={!isReadyToExecute} />
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

      {finished && (
        <>
          <Results
            className='flex flex-col w-full mt-5'
            title='Etapa map'
            data={mapCombinerResults.mapResults}
          />
          <Results
            className='flex flex-col w-full mt-5'
            title='Etapa combiner'
            data={mapCombinerResults.combinerResults}
          />
          <Results
            className='flex flex-col w-full mt-5'
            title='Etapa reduce'
            data={reduceResults}
          />
          <Statistics statistics={statistics} />
        </>
      )}
    </main>
  )
}
