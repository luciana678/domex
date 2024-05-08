import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import useRoom from '@/hooks/useRoom'
import { getConnectionStatus, getExecutionStatus } from '@/utils/users'
import { Box } from '@mui/material'

export default function NodeList() {
  const { clusterUsers } = useRoom()

  return (
    <Card className='bg-white shadow-lg border border-gray-300 rounded-md w-full max-w-[500px]'>
      <CardContent>
        <h2 className='text-lg font-semibold text-center mb-3'>Nodos</h2>
        <Box maxHeight={300} overflow='auto'>
          {clusterUsers.map((node, index) => (
            <Box
              key={index}
              display='flex'
              flexDirection='row'
              alignItems='center'
              mb={1}
              maxHeight={100}
              overflow='auto'>
              <Typography variant='overline' fontSize={18} mr={2}>
                {getConnectionStatus(node)}
              </Typography>
              <Box>
                <Typography fontSize={16} fontWeight={600}>
                  {node.userName}
                </Typography>
                <Typography fontSize={16} fontStyle='italic'>
                  {getExecutionStatus(node)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
