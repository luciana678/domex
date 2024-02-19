'use client'

import Results from '@/components/Results'
import { placeholdersFunctions } from '@/constants/functionCodes'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { ReducerState, UserID } from '@/types'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import useMapReduce from '@/hooks/useMapReduce'

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
  const [finished, setFinished] = useState(false)

  const [mapCode, setMapCode] = useState(WordCountCode.map)
  const [combinerCode, setCombinerCode] = useState(WordCountCode.combiner)
  const [reduceCode, setReduceCode] = useState(WordCountCode.reduce)

  const handleIniciarProcesamiento = () => {
    broadcastMessage({ type: 'SET_CODES', payload: { mapCode, combinerCode, reduceCode } })
  }

  useEffect(() => {
    // If all the combiner results are in, then we can start the reduce phase. Check if isn´t finished yet
    if (finished) return
    if (!Object.keys(mapReduceState.combinerResults).length) return
    if (Object.keys(mapReduceState.combinerResults).length < clusterUsers.length) return

    const totalCounts: { [key: string]: number } = {}

    // Count the total of each key for all the combiners results
    Object.values(mapReduceState.combinerResults).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, count]) => {
        totalCounts[key] = (totalCounts[key] || 0) + count
      })
    })

    const users = Object.keys(mapReduceState.combinerResults) as UserID[]
    const keys = Object.keys(totalCounts)
    const keysPerUser = Math.ceil(keys.length / clusterUsers.length)
    // userKeys is an object that contains the keys that each user will reduce
    const userKeys: { [key: UserID]: ReducerState['reduceKeys'] } = {} //TODO: check if string is the correct type, can be a serializable type
    let userIndex = 0

    // Divide the keys between the users
    for (let i = 0; i < keys.length; i += keysPerUser) {
      userKeys[users[userIndex]] = Object.fromEntries(
        keys.slice(i, i + keysPerUser).map((key) => [key, totalCounts[key]]),
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
          reduceKeys: userKeys[user],
          sendKeys: sendKeys[user],
          receiveKeysFrom: receiveKeysFrom[user] || [],
        },
      }),
    )

    setFinished(true)
  }, [clusterUsers.length, finished, sendDirectMessage, mapReduceState.combinerResults])

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
      <Button variant='outlined' color='success' onClick={handleIniciarProcesamiento}>
        Iniciar procesamiento
      </Button>
      <Results className='flex flex-col w-full mt-5' data={mapReduceState.resultadoFinal} />
    </main>
  )
}
function forEach(arg0: (userFrom: UserID) => void) {
  throw new Error('Function not implemented.')
}
