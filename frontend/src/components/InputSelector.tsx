'use client'

import { Tree } from '@/types'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction } from 'react'
import FolderTree from './ui/FolderTree'
import { ENVS } from '@/constants/envs'

export default function InputSelector({
  filesState,
  enableEditing,
}: {
  filesState: [File[], Dispatch<SetStateAction<File[]>>]
  enableEditing: boolean
}) {
  const { ACCEPT: ACCEPT_TYPE, MAX_SIZE } = ENVS.GENERAL.FILES
  const MAX_SIZE_MB = MAX_SIZE / 1024 / 1024

  const [selectedFiles, setSelectedFiles] = filesState

  const treeFiles: Tree = {
    name: '/',
    isFolder: true,
    items:
      selectedFiles.length > 0
        ? selectedFiles.map((file) => {
            return {
              name: file.name,
              isFolder: false,
            }
          })
        : undefined,
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    // Check if there are files
    if (!files) return

    // Filter the text files and the ones that his size is less than MAX_SIZE
    const txtFiles = Array.from(files)
      .filter((file) => file.type === 'text/plain')
      .filter((file) => file.size < MAX_SIZE)

    setSelectedFiles((prevFiles) => {
      const uniqueFiles = txtFiles.filter(
        (newFile) => !prevFiles.some((oldFile) => oldFile.name === newFile.name),
      )
      return [...prevFiles, ...uniqueFiles]
    })
  }

  const handleDeleteFile = (name: string) => {
    console.log({ name, selectedFiles })
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== name))
  }

  return (
    <>
      <div className='flex justify-center flex-col'>
        <input
          type='file'
          id='fileInput'
          accept={ACCEPT_TYPE}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          onClick={(event) => {
            const inputElement = event.target as HTMLInputElement
            inputElement.value = ''
          }}
        />
        <label htmlFor='fileInput' className='mx-auto'>
          <Button
            component='span'
            variant='contained'
            startIcon={<CloudUploadIcon />}
            disabled={!enableEditing}>
            Seleccionar archivos
          </Button>
        </label>
        <span className='text-center text-pretty opacity-80 text-sm'>
          Deben ser {ACCEPT_TYPE} de máximo {MAX_SIZE_MB}Mb cada uno
        </span>
      </div>
      {selectedFiles.length > 0 ? (
        <FolderTree
          tree={treeFiles}
          handleDeleteFile={handleDeleteFile}
          enableDeleteFile={enableEditing}
        />
      ) : null}
    </>
  )
}
