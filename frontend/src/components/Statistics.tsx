import { Statistics as StatisticsType } from '@/types'
import { Box } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { PieChart } from '@mui/x-charts'

export function StatisticsCard({ title, data }: StatisticsType) {
  return (
    <Card className='bg-white shadow-lg'>
      <CardContent>
        <Typography variant='h5' component='div' className='mb-2'>
          {title}
        </Typography>
        {data.map((statistic, index) => (
          <Typography color='text.secondary' key={index} className='mb-1'>
            {statistic.label}: {statistic.value}
          </Typography>
        ))}
        {!data.length && (
          <Typography color='text.secondary' className='italic'>
            Etapa no ejecutada
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export function Statistics({
  info,
}: {
  info: {
    statistics: StatisticsType[]
    charts: {
      executionTime: any
    }
  }
}) {
  return (
    <>
      <Typography variant='h4' component='div' className='pt-4'>
        Estadísticas
      </Typography>
      <div className='m-5 w-full grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-5'>
        {info.statistics?.map((statistic, index) => <StatisticsCard key={index} {...statistic} />)}
      </div>

      {info.charts.executionTime && (
        <Box className='flex flex-col justify-center items-center gap-2'>
          <PieChart
            {...info.charts.executionTime}
            className='pl-[55px]'
            width={550}
            height={300}
            margin={{
              left: 100,
            }}
          />
          <Typography className='italic'>{info.charts.executionTime.description}</Typography>
          <Typography className='italic text-xs'>{info.charts.executionTime.helperText}</Typography>
        </Box>
      )}
    </>
  )
}
