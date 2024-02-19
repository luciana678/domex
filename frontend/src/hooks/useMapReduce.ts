import MapReduceContext from '@/context/MapReduceContext'
import { useContext } from 'react'

const useMapReduce = () => {
  const { mapReduceState, dispatchMapReduce } = useContext(MapReduceContext)

  return { mapReduceState, dispatchMapReduce }
}

export default useMapReduce
