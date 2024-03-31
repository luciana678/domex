import FilesContext from '@/context/FilesContext'
import { Action, actionTypes } from '@/context/MapReduceContext'
import { Tree, UserID } from '@/types'
import { useContext, useEffect } from 'react'
import usePeers from './usePeers'
import useRoom from './useRoom'

const useFiles = () => {
  const { selectedFiles, setSelectedFiles, nodesFiles, setNodesFiles } = useContext(FilesContext)
  const { broadcastMessage } = usePeers()
  const { clusterUsers } = useRoom()

  const ownFileTree: Tree = {
    name: '/ (local)',
    isFolder: true,
    items: selectedFiles.map((file) => {
      return {
        isLocal: true,
        name: file.name,
        isFolder: false,
      }
    }),
  }

  const nodesFileTree: Tree[] = [
    ...Object.entries(nodesFiles)
      .filter(([_, fileNames]) => fileNames.length > 0)
      .map(([userId, fileNames]) => {
        const username = clusterUsers.find((user) => user.userID === userId)?.userName

        return {
          name: `/ (remote) ${username}`,
          isFolder: true,
          items: fileNames.map((file) => {
            return {
              name: file,
              isFolder: false,
            }
          }),
        }
      }),
  ]

  const nodeHasFiles = !!ownFileTree.items?.length

  const fileTrees = ownFileTree.items?.length ? [ownFileTree, ...nodesFileTree] : nodesFileTree

  const fileOwnersCount = fileTrees.length

  useEffect(() => {
    // Broadcast own files to all peers
    const fileNames = selectedFiles.map((file) => file.name)
    broadcastMessage({ type: 'UPDATE_FILES', payload: { fileNames } })
  }, [broadcastMessage, selectedFiles])

  useEffect(() => {
    // Remove files from nodes that are no longer in the cluster
    setNodesFiles((prevFiles) => {
      const newFiles = { ...prevFiles }
      const nodeUserIDs = Object.keys(prevFiles) as UserID[]

      nodeUserIDs.forEach((userID) => {
        if (!clusterUsers.some((user) => user.userID === userID)) {
          delete newFiles[userID]
        }
      })

      return newFiles
    })
  }, [clusterUsers, setNodesFiles])

  const deleteFile = (name: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== name))
  }

  const addFiles = (files: File[]) => {
    setSelectedFiles((prevFiles) => {
      const uniqueFiles = files.filter(
        (newFile) => !prevFiles.some((oldFile) => oldFile.name === newFile.name),
      )
      return [...prevFiles, ...uniqueFiles]
    })
  }

  const handleReceivingFiles = (action: Action) => {
    if (action.type === actionTypes.UPDATE_FILES) {
      setNodesFiles((prevFiles) => {
        return { ...prevFiles, [action.userID]: action.payload.fileNames }
      })
    }
  }

  return {
    selectedFiles,
    fileTrees,
    deleteFile,
    addFiles,
    handleReceivingFiles,
    fileOwnersCount,
    nodeHasFiles,
  }
}

export default useFiles
