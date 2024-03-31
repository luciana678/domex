import { Action, actionTypes } from '@/context/MapReduceContext'
import { User } from '@/types'

export function handleActionSignal({
  action,
  setClusterUsers,
}: {
  action: Action
  setClusterUsers: React.Dispatch<React.SetStateAction<User[]>>
}) {
  if (action.type === actionTypes.SET_READY_TO_EXECUTE) {
    return setClusterUsers((clusterUsers) =>
      clusterUsers.map((user) => {
        if (user.userID === action.userID) {
          return { ...user, readyToExecuteMap: action.payload }
        }
        return user
      }),
    )
  }
}
