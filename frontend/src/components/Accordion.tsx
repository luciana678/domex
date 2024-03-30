'use client'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import CodeEditor from './CodeEditor'
import { useEffect, useState } from 'react'

export default function BasicAccordion({
  title,
  codeState,
  error = '',
  showLoadFileButton = true,
  codeEditorProps,
}: {
  title: string
  codeState: any
  error: string
  showLoadFileButton?: boolean
  codeEditorProps?: any
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [code, setCode] = codeState

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const files = event.target.files
    if (files && files.length > 0 && files[0].type === 'text/plain') {
      setSelectedFile(files[0])
    }
  }

  useEffect(() => {
    const readFile = async () => {
      if (selectedFile) {
        const fileContent = await selectedFile.text()
        setCode(fileContent)
      }
    }

    readFile()
  }, [selectedFile, setCode])

  return (
    <Accordion
      className='shadow-sm border rounded-md'
      sx={{
        width: '100%',
        mb: 2.5,
      }}
      defaultExpanded={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex w-full'>
          <Typography
            sx={{
              flexGrow: 1,
            }}>
            {title}
          </Typography>
          <span className='text-red-500 mr-2'>{error}</span>
          {showLoadFileButton && (
            <>
              <input
                type='file'
                id={title}
                accept='.py'
                style={{ display: 'none' }}
                onChange={handleFileChange}
                onClick={(event) => {
                  event.stopPropagation()
                }}
              />
              <label htmlFor='fileInput'>
                <Button
                  sx={{
                    ml: 5,
                  }}
                  variant='outlined'
                  component='span'
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    document.getElementById(title)?.click()
                  }}>
                  Cargar archivo
                </Button>
              </label>
            </>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails className='w-full h-[200px] p-0'>
        <CodeEditor
          value={code}
          onChange={(value) => setCode && setCode(value)}
          {...codeEditorProps}
        />
      </AccordionDetails>
    </Accordion>
  )
}
