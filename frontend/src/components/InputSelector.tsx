'use client'

import { ENVS } from '@/constants/envs'
import useFiles from '@/hooks/useFiles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import FolderTree from './ui/FolderTree'

export default function InputSelector({ enableEditing }: { enableEditing: boolean }) {
  const { ACCEPT: ACCEPT_TYPE, MAX_SIZE } = ENVS.GENERAL.FILES
  const MAX_SIZE_MB = MAX_SIZE / 1024 / 1024

  const { deleteFile, addFiles, fileTrees } = useFiles()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    // Check if there are files
    if (!files) return

    // Filter the text files and the ones that his size is less than MAX_SIZE
    const txtFiles = Array.from(files)
      .filter((file) => file.type === 'text/plain')
      .filter((file) => file.size < MAX_SIZE)

    addFiles(txtFiles)
  }

  const handleDeleteFile = (name: string) => {
    deleteFile(name)
  }

  return (
    <div>
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
      {fileTrees.map((fileTree) => (
        <FolderTree
          key={fileTree.name}
          tree={fileTree}
          handleDeleteFile={handleDeleteFile}
          enableDeleteFile={enableEditing}
        />
      ))}
    </div>
  )
}
