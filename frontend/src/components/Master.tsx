'use client'

import { Button } from '@mui/material'
import BasicAccordion from './Accordion'
import Navbar from './Navbar'
import NodeList from './NodeList'
import { placeholdersFunctions } from '@/constants/functionCodes'
import Results from '@/components/Results'
import { useEffect, useState } from 'react'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { ReducerState, UserID } from '@/types'

export default function Master() {
  const { clusterUsers, roomSession, state } = useRoom() as {
    state: ReducerState
    clusterUsers: any
    roomSession: any
  }
  const { sendDirectMessage, broadcastMessage, peers } = usePeers()
  const [finalizado, setFinalizado] = useState(false)

  const [mapCode, setMapCode] = useState(`def fmap(value):
    words = value.split()
    for w in words:
        context.write(w, 1)
  `)
  const [combinerCode, setCombinerCode] = useState(`def fcomb(key, values):
    context.write(key, sum(values))
  `)
  const [reduceCode, setReduceCode] = useState(`def fred(key, values):
    context.write(key, sum(values))
  `)

  const data = [
    { key: 'Nombre', value: 'John Doe' },
    { key: 'Edad', value: 25 },
    { key: 'Ubicación', value: 'Ciudad XYZ' },
  ]

  const handleIniciarProcesamiento = () => {
    broadcastMessage({ type: 'SET_CODES', payload: { mapCode, combinerCode, reduceCode } })
  }

  useEffect(() => {
    if (finalizado) return
    if (!Object.keys(state.combinerResults).length) return
    if (Object.keys(state.combinerResults).length < clusterUsers.length) return

    const totalCounts: { [key: string]: number } = {}

    Object.values(state.combinerResults).forEach((keyList) => {
      Object.entries(keyList).forEach(([key, count]) => {
        totalCounts[key] = (totalCounts[key] || 0) + (count as number)
      })
    })

    const users = Object.keys(state.combinerResults)
    const keys = Object.keys(totalCounts)
    const keysPerUser = Math.ceil(keys.length / clusterUsers.length)
    const userKeys: { [key: string]: { [key: string]: any } } = {}
    let userIndex = 0

    for (let i = 0; i < keys.length; i += keysPerUser) {
      userKeys[users[userIndex]] = Object.fromEntries(
        keys.slice(i, i + keysPerUser).map((key) => [key, totalCounts[key]]),
      )
      userIndex++
    }

    const sendKeys: { [user: string]: any } = {}

    const findUserWithKey = (key: string) =>
      Object.keys(userKeys).find((user) => !!userKeys[user][key])

    users.forEach((user) => {
      sendKeys[user] = {} as any
      Object.keys(state.combinerResults[user]).forEach((key) => {
        if (!userKeys[user][key]) {
          let userWithKey = findUserWithKey(key) as string
          if (sendKeys[user][userWithKey]) {
            sendKeys[user][userWithKey] = [...sendKeys[user][userWithKey], key]
          } else {
            sendKeys[user][userWithKey] = [key]
          }
        }
      })
    })

    const receiveKeysFrom: { [key: string]: string[] } = {}

    Object.keys(sendKeys).forEach((userFrom) => {
      Object.keys(sendKeys[userFrom]).forEach((userTo) => {
        if (!receiveKeysFrom[userTo]) {
          receiveKeysFrom[userTo] = [userFrom]
        } else {
          receiveKeysFrom[userTo] = [...receiveKeysFrom[userTo], userFrom]
        }
      })
    })

    users.forEach((user) =>
      sendDirectMessage(user as UserID, {
        type: 'EJECUTAR_REDUCE',
        payload: {
          reduceKeys: userKeys[user],
          sendKeys: sendKeys[user],
          receiveKeysFrom: receiveKeysFrom[user],
        },
      }),
    )
    setFinalizado(true)
  }, [clusterUsers.length, finalizado, sendDirectMessage, state.combinerResults])

  console.log('state master', state)

  return (
    <main className='flex min-h-screen flex-col items-center p-5'>
      <Navbar title={`Administrarcluster #${roomSession?.roomID}`} />
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
      <Results className='flex flex-col w-full mt-5' data={state.resultadoFinal} />
    </main>
  )
}
