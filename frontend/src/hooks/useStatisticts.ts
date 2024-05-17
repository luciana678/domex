import { FinalResults } from '@/types'
import { formatTime, sumValues } from '@/utils/helpers'
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

  return {
    statistics: [
      {
        title: 'Etapa map',
        data: [
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
                { label: 'Tiempo promedio de ejecución', value: formatTime(times.avgMapTime) },
                { label: 'Tiempo máximo de ejecución', value: formatTime(times.maxMapTime) },
                { label: 'Tiempo mínimo de ejecución', value: formatTime(times.minMapTime) },
              ]
            : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.mapCodeTime) }]),
        ],
      },
      {
        title: 'Etapa combine',
        data: [
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
                {
                  label: 'Tiempo promedio de ejecución',
                  value: formatTime(times.avgCombinerTime),
                },
                {
                  label: 'Tiempo máximo de ejecución',
                  value: formatTime(times.maxCombinerTime),
                },
                {
                  label: 'Tiempo mínimo de ejecución',
                  value: formatTime(times.minCombinerTime),
                },
              ]
            : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.combinerCodeTime) }]),
        ],
      },
      {
        title: 'Etapa reduce',
        data: [
          ...(reducerNodesCount
            ? [{ label: 'Cantidad de nodos reducers', value: reducerNodesCount }]
            : []),
          { label: 'Cantidad de claves recibidas de otros nodos', value: sizes.totalKeysReceived },
          {
            label: 'Cantidad de valores recibidos de otros nodos',
            value: sizes.totalValuesReceived,
          },
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
                {
                  label: 'Tiempo promedio de ejecución',
                  value: formatTime(times.avgReduceTime),
                },
                { label: 'Tiempo máximo de ejecución', value: formatTime(times.maxReduceTime) },
                { label: 'Tiempo mínimo de ejecución', value: formatTime(times.minReduceTime) },
              ]
            : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.reduceCodeTime) }]),
        ],
      },
    ],
    charts: {
      executionTime: {
        series: [
          {
            arcLabel: (item) => `${item.label} (${formatTime(item.value)})`,
            valueFormatter: (data) => formatTime(data.value),
            arcLabelMinAngle: 1,
            data: [
              { label: 'Map', value: mapNodesCount ? times.avgMapTime : sizes.mapCodeTime },
              {
                label: 'Combiner',
                value: mapNodesCount ? times.avgCombinerTime : sizes.combinerCodeTime,
              },
              {
                label: 'Reduce',
                value: mapNodesCount ? times.avgReduceTime : sizes.reduceCodeTime,
              },
            ],
          },
        ],
        width: 550,
        height: 300,
      },
    },
  }
}
