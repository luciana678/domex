'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { FinalResults, KeyValue, KeyValues, MapCombinerResults, Sizes, UserID } from '@/types'

import { placeholdersFunctions } from '@/constants/functionCodes'

import { socket } from '@/socket'

import { concatenateFiles, resetPythonFiles } from '@/utils/helpers'
import { PY_MAIN_CODE } from '@/utils/python/tmp'

import useFiles from '@/hooks/useFiles'
import useMapReduce from '@/hooks/useMapReduce'
import usePeers from '@/hooks/usePeers'
import { usePythonCodeValidator } from '@/hooks/usePythonCodeValidator'
import useRoom from '@/hooks/useRoom'
import useStatistics from '@/hooks/useStatisticts'
import { useExecutionStatus } from '@/hooks/useExecutionStatus'

import { Button } from '@mui/material'
import InputSelector from '@/components/InputSelector'
import { Statistics } from '@/components/Statistics'
import { initialSizes } from '@/context/MapReduceContext'
import BasicAccordion from '@/components/Accordion'
import Navbar from '@/components/Navbar'
import NodeList from '@/components/NodeList'
import Output from '@/components/Output'
import Results from '@/components/Results'
import { FolderList } from '@/components/ui/FolderTree'

const initialMapCombinerResults: MapCombinerResults = {
  mapResults: {},
  combinerResults: {},
}

const initialFinalResults: FinalResults = {
  mapTotalCount: {},
  combinerTotalCount: {},
  sizes: initialSizes,
}

const editorProps = {
  showLoadFileButton: false,
  codeEditorProps: {
    readOnly: true,
  },
}

export default function Slave() {
  const { roomOwner, roomSession, setIsReadyToExecute, isReadyToExecute } = useRoom()

  const { sendDirectMessage, broadcastMessage } = usePeers()

  const { mapReduceState } = useMapReduce()

  const { selectedFiles, deleteFile, fileTrees } = useFiles()

  const [mapCombinerResults, setMapCombinerResults] =
    useState<MapCombinerResults>(initialMapCombinerResults)
  const [reduceResults, setReduceResults] = useState<KeyValue>({})
  const [finalResults, setFinalResults] = useState<FinalResults>(initialFinalResults)

  const [keysSent, setKeysSent] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mapCombinerExecuted, setMapCombinerExecuted] = useState(false)
  const [executing, setExecuting] = useState(false)

  const { isReducerNode } = useExecutionStatus({ started, isReadyToExecute })

  const timesReseted = useRef({
    global: -1,
    withErrors: -1,
  })

  const executionStopped = useRef(false)

  const mapExecuted = !!mapReduceState.finishedMapNodes

  const {
    runPython,
    writeFile,
    readFile,
    isReady,
    readErrors,
    resetStdoutHistory,
    interruptExecution,
    isRunning,
  } = usePythonCodeValidator(executionStopped.current)

  const statistics = useStatistics(finalResults)

  const resetState = useCallback(
    async (resetReadyToExecute: boolean) => {
      executionStopped.current = resetReadyToExecute
      isRunning && interruptExecution()
      setMapCombinerResults(initialMapCombinerResults)
      setReduceResults({})
      setFinalResults(initialFinalResults)
      setKeysSent(false)
      setFinished(false)
      setMapCombinerExecuted(false)
      setStarted(false)
      resetStdoutHistory()
      setExecuting(false)
      resetReadyToExecute && setIsReadyToExecute(false)
    },
    [interruptExecution, resetStdoutHistory, setIsReadyToExecute, isRunning],
  )

  useEffect(() => {
    if (mapReduceState.resetState < 0 || timesReseted.current.global === mapReduceState.resetState)
      return

    timesReseted.current.global += 1
    executionStopped.current = false
    resetState(false)
  }, [mapReduceState.resetState, resetState])

  useEffect(() => {
    if (
      mapReduceState.resetReadyToExecute < 0 ||
      timesReseted.current.withErrors === mapReduceState.resetReadyToExecute
    )
      return

    timesReseted.current.withErrors += 1
    resetState(true)
  }, [mapReduceState.resetReadyToExecute, resetState])

  useEffect(() => {
    setStarted(false)
    broadcastMessage({
      type: 'SET_READY_TO_EXECUTE',
      payload: isReadyToExecute,
    })
  }, [broadcastMessage, isReadyToExecute])

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
    if (executing || executionStopped.current) return
    if (mapCombinerExecuted) return

    if (mapReduceState.errors) return

    // the map code has not been received yet
    if (mapReduceState.code.mapCode === placeholdersFunctions.map.code) return

    // yet the python code cannot be executed
    if (!isReady) return

    setStarted(true)

    const runCode = async () => {
      await runPython(resetPythonFiles)

      const readMapCombinerResults = async (): Promise<MapCombinerResults> => {
        const mapResults: KeyValues = JSON.parse((await readFile('/map_results.json')) || '')
        const combinerResults: KeyValues = JSON.parse(
          (await readFile('/combiner_results.json')) || '',
        )
        return { mapResults, combinerResults }
      }

      setMapCombinerResults(initialMapCombinerResults)
      await writeFile('/input.txt', await concatenateFiles(selectedFiles))
      await writeFile('/map_code.py', mapReduceState.code.mapCode)
      await writeFile('/combiner_code.py', mapReduceState.code.combinerCode)
      await writeFile('/reduce_code.py', mapReduceState.code.reduceCode)
      await runPython(PY_MAIN_CODE)

      const errors = await readErrors()
      if (errors || executionStopped.current) {
        setExecuting(false)
        setStarted(false)
        return
      }

      const mapCombinerResults = await readMapCombinerResults()
      setMapCombinerExecuted(true)
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

      setExecuting(false)
    }

    runCode()
    setExecuting(true)
  }, [
    executing,
    isReady,
    mapCombinerExecuted,
    mapReduceState.errors,
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
    mapCombinerResults,
    readErrors,
  ])

  useEffect(() => {
    // That means that the combiner has been executed. Now we can send the keys to the other users (reducers)
    if (finished || executionStopped.current) return
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

    if (executing || executionStopped.current) return

    if (finished) return
    if (mapReduceState.errors) return
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

      const errors = await readErrors()
      if (errors || executionStopped.current) {
        setExecuting(false)
        setStarted(false)
        return
      }

      const data = (await readFile('/reduce_results.json')) || ''
      const reduceResult: KeyValue = JSON.parse(data)
      setReduceResults(reduceResult)

      const reduceSizes = await readSizes()

      sendDirectMessage(roomOwner?.userID as UserID, {
        type: 'RESULTADO_FINAL',
        payload: {
          incrementReducerNodes: isReducerNode,
          reduceResult,
          sizes: {
            ...finalResults.sizes,
            ...reduceSizes,
            ...receivedDataSizes,
          },
        },
      })

      updateSizes({ ...receivedDataSizes, ...reduceSizes })
      setFinished(true)
      setIsReadyToExecute(false)
      setExecuting(false)
    }

    setExecuting(true)
    readResult()
  }, [
    executing,
    keysSent,
    finished,
    isReady,
    mapCombinerExecuted,
    mapReduceState.errors,
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
    readErrors,
    setIsReadyToExecute,
    isReducerNode,
  ])

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Unido al cluster #${roomSession?.roomID}`} />

      <div className='w-full flex flex-col'>
        <div className='flex flex-col lg:flex-row justify-center w-full gap-10 mb-5'>
          <div className='w-full'>
            <BasicAccordion
              {...editorProps}
              title={placeholdersFunctions.map.title}
              codeState={[mapReduceState.code.mapCode]}
              error={mapReduceState.output.stderr.mapCode}
              loading={started && !mapExecuted && !mapCombinerExecuted && !mapReduceState.errors}
              finished={mapExecuted || mapCombinerExecuted}
            />
            <BasicAccordion
              {...editorProps}
              title={placeholdersFunctions.combiner.title}
              codeState={[mapReduceState.code.combinerCode]}
              error={mapReduceState.output.stderr.combinerCode}
              loading={mapExecuted && !mapCombinerExecuted && !mapReduceState.errors}
              finished={mapCombinerExecuted}
            />
            <BasicAccordion
              {...editorProps}
              title={placeholdersFunctions.reduce.title}
              codeState={[mapReduceState.code.reduceCode]}
              error={mapReduceState.output.stderr.reduceCode}
              loading={mapCombinerExecuted && !finished && !mapReduceState.errors}
              finished={finished}
            />
          </div>
          <div className='flex flex-col sm:flex-row lg:flex-col sm:justify-center lg:justify-start gap-10 items-center w-full min-w-fit lg:max-w-[300px]'>
            <NodeList />

            <FolderList
              fileTrees={fileTrees}
              enableDeleteFile={!isReadyToExecute}
              handleDeleteFile={deleteFile}
            />

            <div className='flex flex-col gap-5'>
              <InputSelector
                enableEditing={!isReadyToExecute}
                isMaster={false}
                id={socket.userID}
              />

              <Button
                className='w-[220px]'
                variant='outlined'
                color={!isReadyToExecute ? 'success' : 'error'}
                onClick={() => setIsReadyToExecute(!isReadyToExecute)}
                disabled={!isReady || started}>
                {isReadyToExecute
                  ? 'Cancelar'
                  : !isReady
                    ? 'Iniciando Python...'
                    : 'Listo para ejecutar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Output stderr={mapReduceState.errors} stdout={mapReduceState.output.stdout} />

      {finished && (
        <>
          <Results title='Etapa map' data={mapCombinerResults.mapResults} />
          <Results title='Etapa combiner' data={mapCombinerResults.combinerResults} />
          <Results title='Etapa reduce' data={reduceResults} />
          <Statistics info={statistics} />
        </>
      )}
    </main>
  )
}
