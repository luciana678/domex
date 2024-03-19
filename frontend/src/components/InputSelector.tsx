'use client'

import { Tree } from '@/types'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { Dispatch, SetStateAction } from 'react'
import FolderTree from './ui/FolderTree'

export default function InputSelector({
  filesState,
  enableEditing,
}: {
  filesState: [File[], Dispatch<SetStateAction<File[]>>]
  enableEditing: boolean
}) {
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
    if (files) {
      const txtFiles = Array.from(files).filter((file) => file.type === 'text/plain')
      setSelectedFiles((prevFiles) => {
        const uniqueFiles = txtFiles.filter(
          (newFile) => !prevFiles.some((oldFile) => oldFile.name === newFile.name),
        )
        return [...prevFiles, ...uniqueFiles]
      })
    }
  }

  const handleDeleteFile = (name: string) => {
    console.log({ name, selectedFiles })
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== name))
  }

  return (
    <div>
      <Card className='bg-white p-4 shadow-lg border border-gray-300 rounded-md min-w-[275]'>
        <h2 className='text-lg font-semibold text-center mb-3'>
          Archivos de entrada seleccionados
        </h2>
        <CardContent>
          {selectedFiles.length > 0 ? (
            <FolderTree
              tree={treeFiles}
              handleDeleteFile={handleDeleteFile}
              enableDeleteFile={enableEditing}
            />
          ) : null}
        </CardContent>
      </Card>
      <div className='mt-3 flex justify-center'>
        <input
          type='file'
          id='fileInput'
          accept='.txt'
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          onClick={(event) => {
            const inputElement = event.target as HTMLInputElement
            inputElement.value = ''
          }}
        />
        <label htmlFor='fileInput'>
          <Button
            component='span'
            variant='contained'
            startIcon={<CloudUploadIcon />}
            disabled={!enableEditing}>
            Seleccionar
          </Button>
        </label>
      </div>
    </div>
  )
}
