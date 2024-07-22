import MapReduceContext from '@/context/MapReduceContext'
import { useContext } from 'react'

const useMapReduce = () => {
  const { mapReduceState, dispatchMapReduce, MapReduceJobCode } = useContext(MapReduceContext)

  return { mapReduceState, dispatchMapReduce, MapReduceJobCode }
}

export default useMapReduce
