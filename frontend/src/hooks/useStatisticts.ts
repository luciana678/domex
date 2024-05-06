import { FinalResults } from '@/types'
import { sumValues } from '@/utils/helpers'
import useMapReduce from '@/hooks/useMapReduce'

export default function useStatistics({
  mapTotalCount,
  combinerTotalCount,
  sizes,
  mapNodesCount,
  reducerNodesCount,
}: FinalResults) {
  const { mapReduceState } = useMapReduce()

  const times = mapReduceState.timeStatistics

  return [
    {
      title: 'Etapa map',
      statistics: [
        ...(mapNodesCount ? [{ label: 'Cantidad de nodos mappers', value: mapNodesCount }] : []),
        { label: 'Cantidad de archivos de entrada', value: sizes.inputFiles },
        { label: 'Tamaño total de las entradas procesadas', value: `${sizes.mapInput} bytes` },
        {
          label: 'Cantidad de claves generadas',
          value: Object.keys(mapTotalCount).length,
        },
        { label: 'Cantidad de valores escritos', value: sumValues(mapTotalCount) },
        { label: 'Tamaño total de la salida generada', value: `${sizes.mapOutput} bytes` },
        ...(mapNodesCount
          ? [
              { label: 'Tiempo promedio de ejecución', value: `${times.avgMapTime}s` },
              { label: 'Tiempo máximo de ejecución', value: `${times.maxMapTime}s` },
              { label: 'Tiempo mínimo de ejecución', value: `${times.minMapTime}s` },
            ]
          : [{ label: 'Tiempo de ejecución', value: `${sizes.mapCodeTime}s` }]),
      ],
    },
    {
      title: 'Etapa combine',
      statistics: [
        {
          label: 'Cantidad de claves generadas',
          value: Object.keys(combinerTotalCount).length,
        },
        {
          label: 'Cantidad de valores escritos',
          value: sumValues(combinerTotalCount),
        },
        { label: 'Tamaño total de la salida generada', value: `${sizes.combinerOutput} bytes` },
        ...(mapNodesCount
          ? [
              { label: 'Tiempo promedio de ejecución', value: `${times.avgCombinerTime}s` },
              { label: 'Tiempo máximo de ejecución', value: `${times.maxCombinerTime}s` },
              { label: 'Tiempo mínimo de ejecución', value: `${times.minCombinerTime}s` },
            ]
          : [{ label: 'Tiempo de ejecución', value: `${sizes.combinerCodeTime}s` }]),
      ],
    },
    {
      title: 'Etapa reduce',
      statistics: [
        ...(reducerNodesCount
          ? [{ label: 'Cantidad de nodos reducers', value: reducerNodesCount }]
          : []),
        { label: 'Cantidad de claves recibidas de otros nodos', value: sizes.totalKeysReceived },
        { label: 'Cantidad de valores recibidos de otros nodos', value: sizes.totalValuesReceived },
        {
          label: 'Tamaño total de los datos recibidos',
          value: `${sizes.totalBytesReceived} bytes`,
        },
        { label: 'Cantidad de claves enviadas a otros nodos', value: sizes.totalKeysSent },
        { label: 'Cantidad de valores enviados a otros nodos', value: sizes.totalValuesSent },
        { label: 'Tamaño total de los datos enviados', value: `${sizes.totalBytesSent} bytes` },
        { label: 'Tamaño total de las entradas procesadas', value: `${sizes.reduceInput} bytes` },
        { label: 'Tamaño total de la salida generada', value: `${sizes.reduceOutput} bytes` },
        ...(reducerNodesCount
          ? [
              { label: 'Tiempo promedio de ejecución', value: `${times.avgReduceTime}s` },
              { label: 'Tiempo máximo de ejecución', value: `${times.maxReduceTime}s` },
              { label: 'Tiempo mínimo de ejecución', value: `${times.minReduceTime}s` },
            ]
          : [{ label: 'Tiempo de ejecución', value: `${sizes.reduceCodeTime}s` }]),
      ],
    },
  ]
}
