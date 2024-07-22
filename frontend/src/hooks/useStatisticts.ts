import { FinalResults } from '@/types'
import { formatTime, sumValues } from '@/utils/helpers'
import useMapReduce from '@/hooks/useMapReduce'

export default function useStatistics({
  mapTotalCount,
  combineTotalCount,
  sizes,
  mapNodesCount,
  reducerNodesCount,
}: FinalResults) {
  const { mapReduceState } = useMapReduce()

  const times = mapReduceState.timeStatistics

  const showExecutionTimeGraph =
    times.avgMapTime +
      times.avgCombineTime +
      times.avgReduceTime +
      sizes.mapTime +
      sizes.combineTime +
      sizes.reduceTime >
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
            : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.mapTime) }]),
        ],
      },
      {
        title: 'Etapa combine',
        data: mapReduceState.code.combineCode
          ? [
              {
                label: 'Cantidad de invocaciones',
                value: sizes.combineCount,
              },
              {
                label: 'Cantidad de claves únicas generadas',
                value: Object.keys(combineTotalCount).length,
              },
              {
                label: 'Cantidad de valores escritos',
                value: sumValues(combineTotalCount),
              },
              {
                label: 'Tamaño total de la salida generada',
                value: `${sizes.combineOutput} bytes`,
              },
              ...(isMaster
                ? [
                    {
                      label: 'Tiempo promedio de ejecución',
                      value: formatTime(times.avgCombineTime),
                    },
                    {
                      label: 'Tiempo máximo de ejecución',
                      value: formatTime(times.maxCombineTime),
                    },
                    {
                      label: 'Tiempo mínimo de ejecución',
                      value: formatTime(times.minCombineTime),
                    },
                  ]
                : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.combineTime) }]),
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
            : [{ label: 'Tiempo de ejecución', value: formatTime(sizes.reduceTime) }]),
        ],
      },
    ],
    charts: {
      executionTime: showExecutionTimeGraph && {
        series: [
          {
            arcLabel: (item: any) => `${item.label} (${formatTime(item.value)})`,
            valueFormatter: (data: any) => formatTime(data.value),
            arcLabelMinAngle: 10,
            data: [
              { label: 'Map', value: isMaster ? times.avgMapTime : sizes.mapTime },
              {
                label: 'Combine',
                value: isMaster ? times.avgCombineTime : sizes.combineTime,
              },
              {
                label: 'Reduce',
                value: isMaster ? times.avgReduceTime : sizes.reduceTime,
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
