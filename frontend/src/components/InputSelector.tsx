'use client'

import { Tree } from '@/types'
import { ENVS } from '@/constants/envs'
import useFiles from '@/hooks/useFiles'
import { FolderList } from '@/components/ui/FolderTree'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import { Tooltip, Zoom } from '@mui/material'

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
      .filter((file) => file.size <= MAX_SIZE)

    addFiles(txtFiles)
  }

  const handleDeleteFile = (tree: Tree) => deleteFile(tree)

  return (
    <div className='w-full'>
      <div className='flex justify-center flex-col'>
        <FolderList
          fileTrees={fileTrees}
          enableDeleteFile={enableEditing}
          handleDeleteFile={handleDeleteFile}
        />

        <input
          type='file'
          id='fileInput'
          accept={ACCEPT_TYPE}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={!enableEditing}
          onClick={(event) => {
            const inputElement = event.target as HTMLInputElement
            inputElement.value = ''
          }}
        />
        <label htmlFor='fileInput' className='mx-auto mt-5'>
          <Tooltip
            TransitionComponent={Zoom}
            title={`Deben ser ${ACCEPT_TYPE} de máximo ${MAX_SIZE_MB}Mb cada uno`}>
            <Button
              className='w-[220px]'
              component='span'
              variant='outlined'
              startIcon={<CloudUploadIcon />}
              disabled={!enableEditing}>
              Cargar archivos
            </Button>
          </Tooltip>
        </label>
      </div>
    </div>
  )
}
