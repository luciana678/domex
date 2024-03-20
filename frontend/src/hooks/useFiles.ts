import FilesContext from '@/context/FilesContext'
import { useContext, useEffect } from 'react'
import usePeers from './usePeers'
import { Action, actionTypes } from '@/context/MapReduceContext'
import { Tree } from '@/types'

const useFiles = () => {
  const { selectedFiles, setSelectedFiles, nodesFiles, setNodesFiles } = useContext(FilesContext)
  const { broadcastMessage } = usePeers()

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

  let fileTrees: Tree[] = [
    ...Object.entries(nodesFiles)
      .filter(([userId, fileNames]) => fileNames.length > 0)
      .map(([userId, fileNames]) => {
        return {
          name: `/ (remote) ${userId}`,
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

  if (ownFileTree.items?.length) {
    fileTrees = [ownFileTree, ...fileTrees]
  }

  useEffect(() => {
    const fileNames = selectedFiles.map((file) => file.name)
    broadcastMessage({ type: 'UPDATE_FILES', payload: { fileNames } })
  }, [broadcastMessage, selectedFiles])

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

  return { selectedFiles, deleteFile, addFiles, handleReceivingFiles, fileTrees }
}

export default useFiles
