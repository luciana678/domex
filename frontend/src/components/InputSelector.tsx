'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

export default function InputSelector({
  filesState,
}: {
  filesState: [File[], Dispatch<SetStateAction<File[]>>]
}) {
  const [selectedFiles, setSelectedFiles] = filesState

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

  const handleDeleteFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Card className='bg-white p-4 shadow-lg border border-gray-300 rounded-md min-w-[275]'>
        <CardContent>
          <h2 className='text-lg font-semibold text-center mb-3'>
            Archivos de entrada seleccionados
          </h2>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className='flex justify-between items-center'>
                <span className='flex-grow'>{file.name}</span>
                <IconButton onClick={() => handleDeleteFile(index)}>
                  <DeleteIcon />
                </IconButton>
              </li>
            ))}
          </ul>
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
          <Button variant='outlined' color='primary' component='span'>
            Seleccionar
          </Button>
        </label>
      </div>
    </div>
  )
}
