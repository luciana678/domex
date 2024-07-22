'use client'

import { Button } from '@mui/material'
import Output from '@/components/Output'
import Results from '@/components/Results'
import { Statistics } from '@/components/Statistics'
import { FolderList } from '@/components/ui/FolderTree'
import { placeholdersFunctions } from '@/constants/functionCodes'
import { Action, initialSizes } from '@/context/MapReduceContext'
import useFiles from '@/hooks/useFiles'
import useMapReduce from '@/hooks/useMapReduce'
import usePeers from '@/hooks/usePeers'
import { usePythonCodeValidator } from '@/hooks/usePythonCodeValidator'
import useRoom from '@/hooks/useRoom'
import useStatistics from '@/hooks/useStatisticts'
import { FinalResults, KeyValuesCount, ReducerState, Tree, UserID, UserResults } from '@/types'
import { LoadingButton } from '@mui/lab'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'

const WordCountCode = {
  map: `def fmap(value):
  words = value.split()
  for w in words:
    context.write(w, 1)
  `,
  combine: `def fcomb(key, values):
  context.write(key, sum(values))
  `,
  reduce: `def fred(key, values):
  context.write(key, sum(values))
  `,
}

const initialFinalResults: FinalResults = {
  mapTotalCount: {},
  combineTotalCount: {},
  sizes: initialSizes,
  mapNodesCount: 0,
  reducerNodesCount: 0,
}

export default function Master() {
  const { clusterUsers, roomSession, toggleRoomLock } = useRoom()
  const { mapReduceState, dispatchMapReduce } = useMapReduce()
  const { sendDirectMessage, broadcastMessage } = usePeers()
  const [allUsersReady, setAllUsersReady] = useState(false)
  const [finalResults, setFinalResults] = useState<FinalResults>(initialFinalResults)
  const [isLoading, setIsLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const { fileTrees, mapNodesCount } = useFiles(isLoading)

  const loading = isLoading && !finished && !mapReduceState.errors

  const [code, setCode] = useState({
    mapCode: WordCountCode.map,
    combineCode: WordCountCode.combine,
    reduceCode: WordCountCode.reduce,
  })

  const statistics = useStatistics(finalResults)

  const { isValidPythonCode, isReady } = usePythonCodeValidator()

  const resetState = () => {
    setFinished(false)
    setFinalResults(initialFinalResults)
  }

  const getTotalCounts = (totalCounts: KeyValuesCount, result: UserResults) =>
    Object.values(result).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, count]) => {
        totalCounts[key] = (totalCounts[key] || 0) + count
      })
    })

  useEffect(() => {
    if (mapReduceState.resetState < 0) return
    resetState()
  }, [mapReduceState.resetState])

  useEffect(() => {
    if (mapReduceState.resetReadyToExecute <= 0) return
    setIsLoading(false)
    toggleRoomLock(false)
  }, [mapReduceState.resetReadyToExecute, toggleRoomLock])

  useEffect(
    () =>
      setFinished(clusterUsers.length > 0 && mapReduceState.finishedNodes === clusterUsers.length),
    [clusterUsers.length, mapReduceState.finishedNodes],
  )

  useEffect(() => {
    if (!finished) return

    setIsLoading(false)
    toggleRoomLock(false)
  }, [finished, toggleRoomLock])

  const handleIniciarProcesamiento = async () => {
    if (!isReady) return
    if (!allUsersReady) return

    const isValidPythonCodePromise = isValidPythonCode(code)

    toast.promise(isValidPythonCodePromise, {
      position: 'bottom-center',
      loading: 'Validando la sintáxis del código...',
      success: () => {
        return 'Sintáxis del código validada correctamente... iniciando el procesamiento '
      },
      error: 'La sintáxis del código no es válida',
    })

    if (!(await isValidPythonCodePromise)) return

    toggleRoomLock(true)
    resetState()
    const action: Action = { type: 'SET_CODES', payload: code }
    broadcastMessage(action)
    dispatchMapReduce(action)
    setIsLoading(true)
  }

  useEffect(() => {
    const totalUsers = clusterUsers.length
    const readyUsers = clusterUsers.filter((user) => user.readyToExecuteMap).length
    setAllUsersReady(totalUsers > 0 && totalUsers === readyUsers)
  }, [clusterUsers])

  useEffect(() => {
    // If all the combine results are in, then we can start the reduce phase. Check if isn´t finished yet
    if (finished || !isLoading) return
    if (!Object.keys(mapReduceState.combineResults).length) return
    if (Object.keys(mapReduceState.combineResults).length < clusterUsers.length) return

    // Count the total of each key for all the map results
    const mapTotalCount: KeyValuesCount = {}
    getTotalCounts(mapTotalCount, mapReduceState.mapResults)

    // Count the total of each key for all the combine results
    const combineTotalCount: KeyValuesCount = {}
    getTotalCounts(combineTotalCount, mapReduceState.combineResults)

    const users = Object.keys(mapReduceState.combineResults) as UserID[]
    const keys = Object.keys(combineTotalCount)
    const keysPerUser = Math.ceil(keys.length / clusterUsers.length)
    // userKeys is an object that contains the keys that each user will reduce
    const userKeys: { [key: UserID]: ReducerState['reduceKeys'] } = {} //TODO: check if string is the correct type, can be a serializable type
    users.forEach((user) => {
      userKeys[user] = {}
    })
    let userIndex = 0

    // Divide the keys between the users
    for (let i = 0; i < keys.length; i += keysPerUser) {
      userKeys[users[userIndex]] = Object.fromEntries(
        keys.slice(i, i + keysPerUser).map((key) => [key, combineTotalCount[key]]),
      )
      userIndex++
    }

    const findUserWithKey = (key: string) =>
      Object.keys(userKeys).find((user) => !!userKeys[user as UserID][key]) as UserID

    // sendKeys is an object that contains the keys that each user will send to another user
    const sendKeys: { [user: UserID]: ReducerState['sendKeys'] } = {}

    users.forEach((user) => {
      sendKeys[user] = {}
      Object.keys(mapReduceState.combineResults[user]).forEach((key) => {
        if (!userKeys[user][key]) {
          let userWithKey = findUserWithKey(key)
          const userSendKeys = (sendKeys[user] as ReducerState['sendKeys']) || {}
          if (userSendKeys[userWithKey]) {
            userSendKeys[userWithKey].push(key)
          } else {
            userSendKeys[userWithKey] = [key]
          }
        }
      })
    })

    // receiveKeysFrom is an object that contains the users that will receive keys from another user
    const receiveKeysFrom: { [key: UserID]: UserID[] } = {}

    // users that will send keys to another user
    const usersToSendKeys = Object.keys(sendKeys) as UserID[]
    usersToSendKeys.forEach((userFrom) => {
      // users that will receive keys from userFrom
      const usersTo = Object.keys(
        (sendKeys[userFrom] as ReducerState['sendKeys']) || {},
      ) as UserID[]
      usersTo.forEach((userTo) => {
        if (!receiveKeysFrom[userTo]) {
          receiveKeysFrom[userTo] = [userFrom]
        } else {
          receiveKeysFrom[userTo].push(userFrom)
        }
      })
    })

    users.forEach((user) =>
      sendDirectMessage(user, {
        type: 'EJECUTAR_REDUCE',
        payload: {
          reduceKeys: userKeys[user] || {},
          sendKeys: sendKeys[user] || {},
          receiveKeysFrom: receiveKeysFrom[user] || [],
        },
      }),
    )

    setFinalResults((prev) => ({
      ...prev,
      mapTotalCount,
      combineTotalCount,
      reducerNodesCount: Object.keys(userKeys).filter(
        (user) => Object.values(userKeys[user as UserID]).length > 0,
      ).length,
    }))
  }, [
    clusterUsers.length,
    sendDirectMessage,
    mapReduceState.combineResults,
    finished,
    mapReduceState.mapResults,
    isLoading,
  ])

  useEffect(() => {
    setFinalResults((prev) => ({
      ...prev,
      sizes: mapReduceState.sizes,
      mapNodesCount: mapReduceState.mapNodesCount,
    }))
  }, [mapReduceState.sizes, mapReduceState.mapNodesCount])

  const processingButtonText = !isReady
    ? 'Iniciando Python...'
    : !allUsersReady
      ? 'Esperando a los nodos'
      : 'Iniciar procesamiento'

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Administrando cluster #${roomSession?.roomID}`} />
      <div className='flex flex-col lg:flex-row justify-center w-full gap-10 mb-5'>
        <div className='w-full'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            codeState={[code.mapCode, (newCode: string) => setCode({ ...code, mapCode: newCode })]}
            error={mapReduceState.output.stderr.mapCode}
            fileButtonDisabled={loading}
            total={mapNodesCount}
            current={mapReduceState.finishedMapNodes}
          />
          <BasicAccordion
            title={placeholdersFunctions.combine.title}
            codeState={[
              code.combineCode,
              (newCode: string) => setCode({ ...code, combineCode: newCode }),
            ]}
            error={mapReduceState.output.stderr.combineCode}
            fileButtonDisabled={loading}
            total={mapNodesCount}
            current={
              mapReduceState.code.combineCode
                ? mapReduceState.finishedCombineNodes
                : mapReduceState.finishedMapNodes
            }
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            codeState={[
              code.reduceCode,
              (newCode: string) => setCode({ ...code, reduceCode: newCode }),
            ]}
            error={mapReduceState.output.stderr.reduceCode}
            fileButtonDisabled={loading}
            total={finalResults.reducerNodesCount}
            current={mapReduceState.finishedReducerNodes}
          />
        </div>
        <div className='flex flex-col sm:flex-row lg:flex-col sm:justify-center lg:justify-start gap-10 items-center w-full min-w-fit lg:max-w-[300px]'>
          <NodeList />

          <FolderList
            fileTrees={fileTrees}
            forceEnableDeleteFile={!isLoading}
            handleDeleteFile={(tree: Tree) =>
              sendDirectMessage(tree.ownerId, {
                type: 'DELETE_FILE',
                payload: tree,
              })
            }
          />

          <div className='flex flex-col'>
            <LoadingButton
              variant='outlined'
              color='success'
              onClick={handleIniciarProcesamiento}
              loading={loading}
              loadingPosition='center'
              disabled={!allUsersReady || loading || !isReady}>
              {processingButtonText}
            </LoadingButton>

            {loading && (
              <Button
                variant='outlined'
                color='error'
                className='mt-2 w-[220px]'
                onClick={() => {
                  broadcastMessage({ type: 'RESET_READY_TO_EXECUTE' })
                  dispatchMapReduce({ type: 'RESET_READY_TO_EXECUTE' })
                  resetState()
                  setIsLoading(false)
                  toggleRoomLock(false)
                }}>
                Detener ejecución
              </Button>
            )}
          </div>
        </div>
      </div>

      <Output stderr={mapReduceState.errors} stdout={mapReduceState.output.stdout} />
      {finished && (
        <>
          <Results className='mt-5' title='Resultados' data={mapReduceState.reduceResult} />
          <Statistics info={statistics} />
        </>
      )}
    </main>
  )
}
