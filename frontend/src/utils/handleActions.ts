import { Action, actionTypes } from '@/context/MapReduceContext'
import { User } from '@/types'

export function handleActionSignal({
  action,
  setClusterUsers,
}: {
  action: Action
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
}) {
  switch (action.type) {
    case actionTypes.SET_READY_TO_EXECUTE:
      setClusterUsers((clusterUsers) =>
        clusterUsers.map((user) => {
          if (user.userID === action.userID) {
            return { ...user, readyToExecuteMap: action.payload }
          }
          return user
        }),
      )
      break

    case actionTypes.SET_EXECUTION_STATUS:
      setClusterUsers((clusterUsers) =>
        clusterUsers.map((user) => {
          if (user.userID === action.userID) {
            return { ...user, executionStatus: action.payload }
          }
          return user
        }),
      )
      break
  }
}
