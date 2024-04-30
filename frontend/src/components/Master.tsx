'use client'

import Results from '@/components/Results'
import { Statistics } from '@/components/Statistics'
import { placeholdersFunctions } from '@/constants/functionCodes'
import useMapReduce from '@/hooks/useMapReduce'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { FinalResults, KeyValuesCount, ReducerState, UserID, UserResults } from '@/types'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import { initialSizes } from '@/context/MapReduceContext'
import useStatistics from '@/hooks/useStatisticts'
import FolderTree from './ui/FolderTree'
import useFiles from '@/hooks/useFiles'
import { usePythonCodeValidator } from '@/hooks/usePythonCodeValidator'
import { toast } from 'sonner'

const WordCountCode = {
  map: `def fmap(value):
  words = value.split()
  for w in words:
    context.write(w, 1)
  `,
  combiner: `def fcomb(key, values):
  context.write(key, sum(values))
  `,
  reduce: `def fred(key, values):
  context.write(key, sum(values))
  `,
}

export default function Master() {
  const { clusterUsers, roomSession, lockRoom } = useRoom()
  const { mapReduceState } = useMapReduce()
  const { sendDirectMessage, broadcastMessage } = usePeers()
  const { fileTrees } = useFiles()
  const [allUsersReady, setAllUsersReady] = useState(false)
  const [finalResults, setFinalResults] = useState<FinalResults>({
    mapTotalCount: {},
    combinerTotalCount: {},
    sizes: initialSizes,
  })
  const finished = !!Object.keys(finalResults.mapTotalCount).length

  const [code, setCode] = useState({
    mapCode: WordCountCode.map,
    combinerCode: WordCountCode.combiner,
    reduceCode: WordCountCode.reduce,
  })

  const [codeErrors, setCodeErrors] = useState({
    mapCode: '',
    combinerCode: '',
    reduceCode: '',
  })

  const statistics = useStatistics(finalResults)

  const { isValidPythonCode, isValidatorReady } = usePythonCodeValidator(code, setCodeErrors)

  const getTotalCounts = (totalCounts: KeyValuesCount, result: UserResults) =>
    Object.values(result).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, count]) => {
        totalCounts[key] = (totalCounts[key] || 0) + count
      })
    })

  const handleIniciarProcesamiento = async () => {
    if (!isValidatorReady) return
    if (!allUsersReady) return

    const isValidPythonCodePromise = isValidPythonCode()

    toast.promise(isValidPythonCodePromise, {
      loading: 'Validando código...',
      success: (ata) => {
        return `Código validado`
      },
      error: 'Error al validar el código',
    })

    const isValid = await isValidPythonCodePromise

    if (!isValid) return

    lockRoom()
    broadcastMessage({ type: 'SET_CODES', payload: code })
  }

  useEffect(() => {
    const totalUsers = clusterUsers.length
    const readyUsers = clusterUsers.filter((user) => user.readyToExecuteMap).length
    setAllUsersReady(totalUsers > 0 && totalUsers === readyUsers)
  }, [clusterUsers])

  useEffect(() => {
    // If all the combiner results are in, then we can start the reduce phase. Check if isn´t finished yet
    if (finished) return
    if (!Object.keys(mapReduceState.combinerResults).length) return
    if (Object.keys(mapReduceState.combinerResults).length < clusterUsers.length) return

    // Count the total of each key for all the map results
    const mapTotalCount: KeyValuesCount = {}
    getTotalCounts(mapTotalCount, mapReduceState.mapResults)

    // Count the total of each key for all the combiners results
    const combinerTotalCount: KeyValuesCount = {}
    getTotalCounts(combinerTotalCount, mapReduceState.combinerResults)

    const users = Object.keys(mapReduceState.combinerResults) as UserID[]
    const keys = Object.keys(combinerTotalCount)
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
        keys.slice(i, i + keysPerUser).map((key) => [key, combinerTotalCount[key]]),
      )
      userIndex++
    }

    const findUserWithKey = (key: string) =>
      Object.keys(userKeys).find((user) => !!userKeys[user as UserID][key]) as UserID

    // sendKeys is an object that contains the keys that each user will send to another user
    const sendKeys: { [user: UserID]: ReducerState['sendKeys'] } = {}

    users.forEach((user) => {
      sendKeys[user] = {}
      Object.keys(mapReduceState.combinerResults[user]).forEach((key) => {
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
      combinerTotalCount,
      reducerNodesCount: Object.keys(userKeys).filter(
        (user) => Object.values(userKeys[user as UserID]).length > 0,
      ).length,
    }))
  }, [
    clusterUsers.length,
    sendDirectMessage,
    mapReduceState.combinerResults,
    finished,
    mapReduceState.mapResults,
  ])

  useEffect(() => {
    setFinalResults((prev) => ({
      ...prev,
      sizes: mapReduceState.sizes,
      mapNodesCount: mapReduceState.mapNodesCount,
    }))
  }, [mapReduceState.sizes, mapReduceState.mapNodesCount])

  const processingButtonText = finished
    ? 'Procesamiento finalizado'
    : !isValidatorReady
      ? 'Inicializando validador...'
      : !allUsersReady
        ? 'Esperando a los nodos'
        : 'Iniciar procesamiento'

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Administrar cluster #${roomSession?.roomID}`} />
      <div className='flex flex-col lg:flex-row justify-center w-full gap-10 mb-5'>
        <div className='w-full'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            codeState={[code.mapCode, (newCode: string) => setCode({ ...code, mapCode: newCode })]}
            error={codeErrors.mapCode}
          />
          <BasicAccordion
            title={placeholdersFunctions.combiner.title}
            codeState={[
              code.combinerCode,
              (newCode: string) => setCode({ ...code, combinerCode: newCode }),
            ]}
            error={codeErrors.combinerCode}
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            codeState={[
              code.reduceCode,
              (newCode: string) => setCode({ ...code, reduceCode: newCode }),
            ]}
            error={codeErrors.reduceCode}
          />
        </div>
        <div className='flex flex-col sm:flex-row lg:flex-col sm:justify-center lg:justify-start gap-10 items-center w-full min-w-fit lg:max-w-[300px]'>
          <NodeList />

          <div className='pt-3 w-60'>
            {fileTrees.map((fileTree) => (
              <FolderTree key={fileTree.name} tree={fileTree} enableDeleteFile={false} />
            ))}
          </div>
        </div>
      </div>
      <Button
        variant='outlined'
        color='success'
        onClick={handleIniciarProcesamiento}
        disabled={!allUsersReady || finished || !isValidatorReady}>
        {processingButtonText}
      </Button>
      <Results title='Resultados' data={mapReduceState.reduceResult} />
      {finished && <Statistics statistics={statistics} />}
    </main>
  )
}
