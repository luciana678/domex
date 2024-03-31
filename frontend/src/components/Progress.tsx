import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function Progress({ total, current }: { total: number; current: number }) {
  const value = total ? Math.round((current / total) * 100) : 0

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant='determinate' value={value} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Typography
          variant='caption'
          component='div'
          color='text.secondary'>{`${value}%`}</Typography>
      </Box>
    </Box>
  )
}
