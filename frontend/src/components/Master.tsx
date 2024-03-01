'use client'

import Results from '@/components/Results'
import { MasterStatistics } from '@/components/Statistics'
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
  const { clusterUsers, roomSession } = useRoom()
  const { mapReduceState } = useMapReduce()
  const { sendDirectMessage, broadcastMessage } = usePeers()
  const [allUsersReady, setAllUsersReady] = useState(false)
  const [finalResults, setFinalResults] = useState<FinalResults>({
    mapTotalCount: {},
    combinerTotalCount: {},
  })
  const finished = !!Object.keys(finalResults.mapTotalCount).length

  const [mapCode, setMapCode] = useState(WordCountCode.map)
  const [combinerCode, setCombinerCode] = useState(WordCountCode.combiner)
  const [reduceCode, setReduceCode] = useState(WordCountCode.reduce)

  const getTotalCounts = (totalCounts: KeyValuesCount, result: UserResults) =>
    Object.values(result).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, count]) => {
        totalCounts[key] = (totalCounts[key] || 0) + count
      })
    })

  const handleIniciarProcesamiento = () => {
    broadcastMessage({ type: 'SET_CODES', payload: { mapCode, combinerCode, reduceCode } })
  }

  useEffect(() => {
    const totalUsers = clusterUsers.length
    const readyUsers = clusterUsers.filter((user) => user.readyToExecuteMap).length
    setAllUsersReady(totalUsers === readyUsers)
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
          if (sendKeys[user][userWithKey]) {
            sendKeys[user][userWithKey].push(key)
          } else {
            sendKeys[user][userWithKey] = [key]
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
      const usersTo = Object.keys(sendKeys[userFrom]) as UserID[]
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

    setFinalResults({
      mapTotalCount,
      combinerTotalCount,
    })
  }, [clusterUsers.length, sendDirectMessage, mapReduceState.combinerResults, finished])

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Administrar cluster #${roomSession?.roomID}`} />
      <div className='flex flex-row justify-center w-full gap-20 mb-5'>
        <div className='w-9/12'>
          <BasicAccordion
            title={placeholdersFunctions.map.title}
            codeState={[mapCode, setMapCode]}
          />
          <BasicAccordion
            title={placeholdersFunctions.combiner.title}
            codeState={[combinerCode, setCombinerCode]}
          />
          <BasicAccordion
            title={placeholdersFunctions.reduce.title}
            codeState={[reduceCode, setReduceCode]}
          />
        </div>
        <div className='flex flex-col w-3/12'>
          <NodeList />
        </div>
      </div>
      <Button
        variant='outlined'
        color='success'
        onClick={handleIniciarProcesamiento}
        disabled={!allUsersReady || finished}>
        Iniciar procesamiento
      </Button>
      <Results className='flex flex-col w-full mt-5' data={mapReduceState.reduceResult} />
      {finished && <MasterStatistics {...finalResults} />}
    </main>
  )
}
