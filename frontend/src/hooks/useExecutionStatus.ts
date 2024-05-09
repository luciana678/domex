import useMapReduce from '@/hooks/useMapReduce'
import useFiles from '@/hooks/useFiles'
import usePeers from '@/hooks/usePeers'
import { useCallback, useEffect } from 'react'

export const useExecutionStatus = ({
  started,
  isReadyToExecute,
}: {
  started: boolean
  isReadyToExecute: boolean
}) => {
  const { nodeHasFiles } = useFiles()
  const { mapReduceState } = useMapReduce()
  const { broadcastMessage } = usePeers()

  const mapExecuted = !!mapReduceState.finishedMapNodes
  const combinerExecuted = !!mapReduceState.finishedCombinerNodes
  const finishedNodes = !!mapReduceState.finishedNodes

  const isMapperNode = nodeHasFiles
  const isReducerNode = Object.keys(mapReduceState.reduceKeys).length > 0

  const updateExecutionStatus = useCallback(
    (status: string) => {
      broadcastMessage({
        type: 'SET_EXECUTION_STATUS',
        payload: status,
      })
    },
    [broadcastMessage],
  )

  useEffect(() => {
    if (!isReadyToExecute && !mapReduceState.errors) {
      updateExecutionStatus('Esperando confirmación')
    } else if (isReadyToExecute) {
      updateExecutionStatus('Listo para ejecutar')
    }
  }, [updateExecutionStatus, isReadyToExecute, mapReduceState.errors])

  useEffect(() => {
    if (started && isMapperNode) {
      updateExecutionStatus(
        !mapExecuted
          ? 'Ejecutando map'
          : mapReduceState.code.combinerCode && !combinerExecuted
            ? 'Ejecutando combiner'
            : 'Esperando claves',
      )
    }
  }, [
    updateExecutionStatus,
    isMapperNode,
    mapExecuted,
    mapReduceState.code.combinerCode,
    started,
    combinerExecuted,
  ])

  useEffect(() => {
    if (started && !isMapperNode) {
      updateExecutionStatus('Esperando claves')
    }
  }, [updateExecutionStatus, isMapperNode, started])

  useEffect(() => {
    if (started && isReducerNode) {
      updateExecutionStatus(finishedNodes ? 'Ejecución finalizada' : 'Ejecutando reduce')
    }
  }, [updateExecutionStatus, started, finishedNodes, isReducerNode])

  useEffect(() => {
    if (!mapReduceState.errors) return

    const errors = mapReduceState.errors

    updateExecutionStatus(
      'Error en ' +
        (errors.includes('map') ? 'map' : errors.includes('combiner') ? 'combine' : 'reduce'),
    )
  }, [updateExecutionStatus, mapReduceState.errors])

  return {
    isReducerNode,
  }
}
