import FilesContext from '@/context/FilesContext'
import { Action, actionTypes } from '@/context/MapReduceContext'
import { Tree, UserID } from '@/types'
import { useCallback, useContext, useEffect } from 'react'
import usePeers from './usePeers'
import useRoom from './useRoom'
import { socket } from '@/socket'

const useFiles = () => {
  const { selectedFiles, setSelectedFiles, nodesFiles, setNodesFiles } = useContext(FilesContext)
  const { broadcastMessage } = usePeers()
  const { clusterUsers } = useRoom()

  const ownFileTree: Tree = {
    name: '/ (local)',
    isFolder: true,
    isLocal: true,
    ownerId: socket.userID,
    items: selectedFiles.map((file) => {
      return {
        isLocal: true,
        name: file.name,
        isFolder: false,
        ownerId: socket.userID,
      }
    }),
  }

  const nodesFileTree: Tree[] = [
    ...Object.entries(nodesFiles)
      .filter(([_, fileNames]) => fileNames.length > 0)
      .map(([userId, fileNames]) => {
        const username = clusterUsers.find((user) => user.userID === userId)?.userName

        return {
          name: `/ ${username} (remote)`,
          isFolder: true,
          ownerId: userId as UserID,
          items: fileNames.map((file) => {
            return {
              name: file,
              isFolder: false,
              ownerId: userId as UserID,
            }
          }),
        }
      }),
  ]

  const nodeHasFiles = !!ownFileTree.items?.length

  const fileTrees = ownFileTree.items?.length ? [ownFileTree, ...nodesFileTree] : nodesFileTree

  useEffect(() => {
    // Broadcast own files to all peers
    const fileNames = selectedFiles.map((file) => file.name)
    broadcastMessage({ type: 'UPDATE_FILES', payload: { fileNames } })
  }, [broadcastMessage, selectedFiles])

  useEffect(() => {
    // Remove files from nodes that are no longer in the cluster, or are disconnected
    setNodesFiles((prevFiles) => {
      const newFiles = { ...prevFiles }
      const nodeUserIDs = Object.keys(prevFiles) as UserID[]

      nodeUserIDs.forEach((userID) => {
        const userInCluster = clusterUsers.find((user) => user.userID === userID)
        const userConnected = userInCluster?.socketConnected

        if (!userInCluster || !userConnected) {
          delete newFiles[userID]
        }
      })

      return newFiles
    })
  }, [clusterUsers, setNodesFiles])

  const deleteFile = (tree: Tree) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== tree.name))
  }

  const addFiles = (files: File[]) => {
    setSelectedFiles((prevFiles) => {
      const uniqueFiles = files.filter(
        (newFile) => !prevFiles.some((oldFile) => oldFile.name === newFile.name),
      )
      return [...prevFiles, ...uniqueFiles]
    })
  }

  const handleReceivingFiles = useCallback(
    (action: Action) => {
      if (action.type === actionTypes.UPDATE_FILES) {
        setNodesFiles((prevFiles) => {
          return { ...prevFiles, [action.userID as UserID]: action.payload.fileNames }
        })
      }

      if (action.type === actionTypes.DELETE_FILE) {
        const deletedFileNames = action.payload.items?.map((item) => item.name) ?? [
          action.payload.name,
        ]
        setSelectedFiles((prevFiles) =>
          prevFiles.filter((file) => !deletedFileNames.includes(file.name)),
        )
      }
    },
    [setNodesFiles, setSelectedFiles],
  )

  return {
    selectedFiles,
    fileTrees,
    deleteFile,
    addFiles,
    handleReceivingFiles,
    nodeHasFiles,
  }
}

export default useFiles
