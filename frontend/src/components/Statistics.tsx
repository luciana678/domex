import { Statistics as StatisticsType } from '@/types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export function StatisticsCard({ title, statistics }: StatisticsType) {
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

export function Statistics({ statistics }: { statistics: StatisticsType[] }) {
  return (
    <>
      <Typography variant='h4' component='div' className='pt-4'>
        Estadísticas
      </Typography>
      <div className='flex justify-around m-5'>
        {statistics.map((info, index) => (
          <StatisticsCard key={index} title={info.title} statistics={info.statistics} />
        ))}
      </div>
    </>
  )
}
