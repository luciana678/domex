import useMapReduce from '@/hooks/useMapReduce'
import useRoom from '@/hooks/useRoom'
import { FinalResults, KeyValuesCount } from '@/types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export function StatisticsCard({
  title,
  statistics,
}: {
  title: string
  statistics: { label: string; value: string }[]
}) {
  return (
    <Card className='w-[400px] bg-white shadow-lg m-2'>
      <CardContent>
        <Typography variant='h5' component='div' className='mb-2'>
          {title}
        </Typography>
        {statistics.map((stat, index) => (
          <Typography color='text.secondary' key={index} className='mb-1'>
            {stat.label}: {stat.value}
          </Typography>
        ))}
      </CardContent>
    </Card>
  )
}

export function MasterStatistics({ mapTotalCount, combinerTotalCount }: FinalResults) {
  const { clusterUsers } = useRoom()
  const { mapReduceState } = useMapReduce()
  const sizes = mapReduceState.sizes || {}
  const combinerResults = mapReduceState.combinerResults
  const cantidadNodosMap = Object.keys(combinerResults).filter(
    (user) => Object.values(combinerResults[user]).length > 0,
  ).length

  const sumValues = (dict: KeyValuesCount) =>
    Object.values(dict).reduce((total, value) => total + value, 0)

  const statisticsInfo = [
    {
      title: 'Etapa map',
      statistics: [
        { label: 'Cantidad de nodos mappers', value: cantidadNodosMap },
        { label: 'Tamaño total de las entradas procesadas', value: `${sizes.mapInput} bytes` },
        {
          label: 'Cantidad de claves generadas',
          value: Object.keys(mapTotalCount).length,
        },
        { label: 'Cantidad de valores escritos', value: sumValues(mapTotalCount) },
        { label: 'Tamaño total de la salida generada', value: `${sizes.mapOutput} bytes` },
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
      ],
    },
    {
      title: 'Etapa reduce',
      statistics: [
        { label: 'Cantidad de nodos reducers', value: clusterUsers.length },
        { label: 'Tamaño total de las entradas procesadas', value: `${sizes.reduceInput} bytes` },
        { label: 'Tamaño total de la salida generada', value: `${sizes.reduceOutput} bytes` },
      ],
    },
  ]

  return (
    <>
      <Typography variant='h4' component='div' className='pt-4'>
        Estadísticas
      </Typography>
      <div className='flex justify-around m-5'>
        {statisticsInfo.map((info, index) => (
          <StatisticsCard key={index} title={info.title} statistics={info.statistics} />
        ))}
      </div>
    </>
  )
}
