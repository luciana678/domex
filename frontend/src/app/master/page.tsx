'use client'

import { Button } from '@mui/material'
import BasicAccordion from '../../components/Accordion'
import Navbar from '../../components/Navbar'
import NodeList from '../../components/NodeList'
import { placeholdersFunctions } from '@/constants/functionCodes'
import Results from '@/components/Results'
import { useState } from 'react'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'

export default function Master() {
  const { clusterUsers, roomSession } = useRoom()
  const { sendDirectMessage } = usePeers()

  const [mapCode, setMapCode] = useState(placeholdersFunctions.map.code)
  const [combinerCode, setCombinerCode] = useState(placeholdersFunctions.combiner.code)
  const [reduceCode, setReduceCode] = useState(placeholdersFunctions.reduce.code)

  const data = [
    { key: 'Nombre', value: 'John Doe' },
    { key: 'Edad', value: 25 },
    { key: 'Ubicación', value: 'Ciudad XYZ' },
  ]

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
          <NodeList nodes={clusterUsers} sendDirectMessage={sendDirectMessage} />
        </div>
      </div>
      <Button variant='outlined' color='success'>
        Iniciar procesamiento
      </Button>
      <Results className='flex flex-col w-full mt-5' data={data} />
    </main>
  )
}
