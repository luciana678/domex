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

  const showExecutionTimeGraph =
    times.avgMapTime +
      times.avgCombinerTime +
      times.avgReduceTime +
      sizes.mapCodeTime +
      sizes.combinerCodeTime +
      sizes.reduceCodeTime >
    0

  const isMaster = !!mapNodesCount

  return {
    statistics: [
      {
        title: 'Etapa map',
        data: [
          ...(isMaster ? [{ label: 'Cantidad de nodos mappers', value: mapNodesCount }] : []),
          {
            label: 'Cantidad de invocaciones',
            value: sizes.mapCount,
          },
          { label: 'Cantidad de archivos de entrada', value: sizes.inputFiles },
          { label: 'Tamaño total de las entradas procesadas', value: `${sizes.mapInput} bytes` },
          {
            label: 'Cantidad de claves únicas generadas',
            value: Object.keys(mapTotalCount).length,
          },
          { label: 'Cantidad de valores escritos', value: sumValues(mapTotalCount) },
          { label: 'Tamaño total de la salida generada', value: `${sizes.mapOutput} bytes` },
          ...(isMaster
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
        data: mapReduceState.code.combinerCode
          ? [
              {
                label: 'Cantidad de invocaciones',
                value: sizes.combinerCount,
              },
              {
                label: 'Cantidad de claves únicas generadas',
                value: Object.keys(combinerTotalCount).length,
              },
              {
                label: 'Cantidad de valores escritos',
                value: sumValues(combinerTotalCount),
              },
              {
                label: 'Tamaño total de la salida generada',
                value: `${sizes.combinerOutput} bytes`,
              },
              ...(isMaster
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
            ]
          : [],
      },
      {
        title: 'Etapa reduce',
        data: [
          ...(reducerNodesCount
            ? [{ label: 'Cantidad de nodos reducers', value: reducerNodesCount }]
            : []),
          {
            label: 'Cantidad de invocaciones',
            value: sizes.reduceCount,
          },
          { label: 'Cantidad de claves recibidas de otros nodos', value: sizes.totalKeysReceived },
          {
            label: 'Cantidad de valores recibidos de otros nodos',
            value: sizes.totalValuesReceived,
          },
          {
            label: 'Tamaño total de los datos recibidos',
            value: `${sizes.totalBytesReceived} bytes`,
          },
          { label: 'Cantidad de claves únicas enviadas a otros nodos', value: sizes.totalKeysSent },
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
      executionTime: showExecutionTimeGraph && {
        series: [
          {
            arcLabel: (item) => `${item.label} (${formatTime(item.value)})`,
            valueFormatter: (data) => formatTime(data.value),
            arcLabelMinAngle: 1,
            data: [
              { label: 'Map', value: isMaster ? times.avgMapTime : sizes.mapCodeTime },
              {
                label: 'Combiner',
                value: isMaster ? times.avgCombinerTime : sizes.combinerCodeTime,
              },
              {
                label: 'Reduce',
                value: isMaster ? times.avgReduceTime : sizes.reduceCodeTime,
              },
            ],
          },
        ],
        description: `Tiempo de ejecución ${isMaster ? 'promedio' : ''} de cada etapa`,
        helperText: isMaster ? 'Datos de todos los nodos' : 'Datos del nodo actual',
      },
    },
  }
}
